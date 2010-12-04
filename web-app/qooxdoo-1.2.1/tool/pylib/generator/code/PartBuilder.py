#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# PartBuilder -- create packages and associates parts to packages, from parts configuration and class list
#
# Interface:
# - PartBuilder.getPackages()
##

import sys
from misc                   import util
from generator.code.Part    import Part
from generator.code.Package import Package

class PartBuilder(object):

    def __init__(self, console, depLoader, compiler):
        self._console   = console
        self._depLoader = depLoader
        self._compiler  = compiler


    ##
    # interface method

    def getPackages(self, partIncludes, smartExclude, jobContext, script):
        # Get config settings
        jobConfig                 = jobContext["jobconf"]
        self._jobconf             = jobConfig
        minPackageSize            = jobConfig.get("packages/sizes/min-package", 0)
        minPackageSizeForUnshared = jobConfig.get("packages/sizes/min-package-unshared", None)
        partsCfg                  = jobConfig.get("packages/parts", {})
        collapseCfg               = jobConfig.get("packages/collapse", [])
        boot                      = jobConfig.get("packages/init", "boot")

        script.boot               = boot

        # Automatically add boot part to collapse list
        if boot in partsCfg and not boot in collapseCfg:
            collapseCfg.append(boot)

        # Preprocess part data
        script.parts    = {}  # map of Parts
        script.parts    = self._getParts(partIncludes, partsCfg, script)
        script.parts    = self._getPartDeps(script, smartExclude)

        # Compute packages
        script.packages = []  # array of Packages
        script.packages = self._getPackages(script)
        script.sortParts()

        self._printPartStats(script)

        # Collapse parts by collapse order
        self.collapsePartsByOrder(script)

        # Collapse parts by package size
        self.collapsePartsBySize(script, minPackageSize, minPackageSizeForUnshared)

        # Size collapsing might introduce new dependencies to the boot part
        # try to assure a single package
        if len(script.parts[script.boot].packages) > 1:
            quickCollapseConfig = { 0 : set((script.parts[script.boot],))}
            self.collapsePartsByOrder(script, quickCollapseConfig)
            assert len(script.parts[script.boot].packages) == 1

        self._printPartStats(script)

        # Post process results
        resultParts = self._getFinalPartData(script)

        # re-sort part packages, to clean up ordering issues from merging
        # - (the issue here is that part packages are only re-sorted during merges
        #   when actually new packages are added to the part, but *not* when existing
        #   packages receive a merge package whos package dependencies are already
        #   fullfilled in the part; still package dependencies among the existing
        #   packages might change so a re-sorting is necessary to support proper
        #   load order)
        script.sortParts()

        script = self._getFinalClassList(script)
        #resultClasses = util.dictToList(resultClasses) # turn map into list, easier for upstream methods

        if True: #self._console.getLevel() < self._console._levels["info"]: # - not working!
            self.verifyParts(script.parts, script)

        # Return
        # {Map}   resultParts[partId] = [packageId1, packageId2]
        # {Array} resultClasses[packageId] = [class1, class2]
        #return boot, resultParts, resultClasses
        return resultParts, script


    def verifyParts(self, partsMap, script):

        def handleError(msg):
            if bomb_on_error:
                raise RuntimeError(msg)
            else:
                self._console.warn("! "+msg)

        self._console.info("Verifying Parts...")
        self._console.indent()
        bomb_on_error = self._jobconf.get("packages/verifier-bombs-on-error", True)

        for part in partsMap.values():
            if part.is_ignored:  # skip ignored parts
                continue
            self._console.info("Verifying: %s" % part.name)
            self._console.indent()
            # get set of current classes in this part
            classList = []
            classPackage = []
            for packageIdx, package in enumerate(part.packages): # TODO: not sure this is sorted
                for classId in package.classes:
                    classList.append(classId)
                    classPackage.append(packageIdx)
            # 1) Check the initial part defining classes are included (trivial sanity)
            for classId in part.initial_deps:
                if classId not in classList:
                    handleError("Defining class not included in part: '%s'" % (classId,))
                    
            # 2) Check individual class deps are fullfilled in part
            # 3) Check classes are in load-order
            # alternative: check part.deps against classSet
            classIdx = -1
            for packageIdx, package in enumerate(part.packages):
                for classId in package.classes:
                    classIdx   += 1
                    classDeps   = self._depLoader.getCombinedDeps(classId, script.variants, script.buildType)
                    loadDeps    = [x.name for x in classDeps['load']]
                    runDeps     = [x.name for x in classDeps['run']]
                    for depsId in loadDeps: # + runDeps:
                        try:
                            depsIdx = classList.index(depsId)
                        except ValueError:
                            handleError("Unfullfilled dependency of class '%s'[%d]: '%s'" % (classId, packageIdx, depsId))
                            continue
                        if depsId in loadDeps and classIdx < depsIdx:
                            handleError("Load-dep loaded after using class ('%s'[%d,%d]):  '%s'[%d,%d]" % (classId, packageIdx, classIdx, depsId, classPackage[depsIdx], depsIdx))
                    #if missingDeps:  # there is a load dep not in the part
                    #    self._console.warn("Unfullfilled load dependencies of class '%s': %r" % (classId, tuple(missingDeps)))
            self._console.outdent()

        self._console.outdent()
        return
    ##
    # create the set of parts, each part with a unique single-bit bit mask
    # @returns {Map} parts = { partName : Part() }

    def _getParts(self, partIncludes, partsCfg, script):
        self._console.debug("Creating part structures...")

        self._console.indent()
        parts = {}
        for partPos, partId in enumerate(partIncludes):
            npart          = Part(partId)    # create new Part object
            npart.bit_mask = script.getPartBitMask()      # add unique bit
            npart.initial_deps = partIncludes[partId][:]  # defining classes from config
            npart.deps     = partIncludes[partId][:]  # initialize dependencies with defining classes
            if 'expected-load-order' in partsCfg[partId]:
                npart.collapse_index = partsCfg[partId]['expected-load-order']
            if 'no-merge-private-package' in partsCfg[partId]:
                npart.no_merge_private_package = partsCfg[partId]['no-merge-private-package']
            parts[partId]  = npart
            self._console.debug("Part #%s => %s" % (partId, npart.bit_mask))

        self._console.outdent()

        return parts


    ##
    # create the complete list of class dependencies for each part

    def _getPartDeps(self, script, smartExclude):
        parts    = script.parts
        variants = script.variants
        classList= script.classes

        self._console.debug("")
        self._console.info("Resolving part dependencies...")
        self._console.indent()

        for part in parts.values():
            # Exclude initial classes of other parts
            partExcludes = []
            for otherPartId in parts:
                if otherPartId != part.name:
                    partExcludes.extend(parts[otherPartId].initial_deps)

            # Extend with smart excludes
            partExcludes.extend(smartExclude)

            # Remove unknown classes before checking dependencies
            for classId in part.deps[:]:
                if not classId in classList:
                    part.deps.remove(classId)

            # Checking we have something to include
            if len(part.deps) == 0:
                self._console.info("Part #%s is ignored in current configuration" % part.name)
                part.is_ignored = True
                continue

            # Finally resolve the dependencies
            partClasses = self._depLoader.classlistFromInclude(part.deps, partExcludes, variants, script=script)

            # Remove all unknown classes
            for classId in partClasses[:]:  # need to work on a copy because of changes in the loop
                if not classId in classList:
                    partClasses.remove(classId)

            # Store
            self._console.debug("Part #%s depends on %s classes" % (part.name, len(partClasses)))
            part.deps = partClasses

        self._console.outdent()
        return parts


    ##
    # cut an initial set of packages out of the set of classes needed by the parts
    # @returns {Map} { packageId : Package }

    def _getPackages(self, script):
        self._console.indent()

        parts = script.parts
        # Generating list of all classes
        allClasses = {}
        for part in parts.values():
            for classId in part.deps:
                allClasses[classId] = True

        # Check for each class which part is using it;
        # create a package for each set of classes which
        # are used by the same combination of parts;
        # track how many parts are using a particular package
        packages = {}
        for classId in allClasses.keys():
            pkgId     = 0

            for part in parts.values():
                if classId in part.deps:
                    pkgId     |= part.bit_mask

            if not packages.has_key(pkgId):
                package            = Package(pkgId)
                packages[pkgId]    = package

            packages[pkgId].classes.append(classId)

        # Which packages does a part use - and vice versa
        for package in packages.values():
            for part in parts.values():
                if package.id & part.bit_mask:
                    #part.packages.append(package.id)
                    part.packages.append(package)
                    #package.parts.append(part.name)
                    #package.parts.append(part)
                    
            #package.part_count = len(package.parts)

        # Register dependencies between Packages
        for package in packages.values():
            # get all direct deps of this package
            allDeps = set(())
            for classId in package.classes:
                classDeps   = self._depLoader.getCombinedDeps(classId, script.variants, script.buildType)
                loadDeps    = set(x.name for x in classDeps['load'])
                allDeps.update(loadDeps)

            # record the other packages in which these dependencies are located
            for classId in allDeps:
                for otherpackage in packages.values():
                    if otherpackage != package and classId in otherpackage.classes:
                        #print "-- package %s adding dependent package %s" % (package.id, otherpackage.id)
                        package.packageDeps.add(otherpackage)
         
        self._console.outdent()
        return packages.values()


    def _computePackageSize(self, package, variants):
        packageSize = 0

        self._console.indent()
        for classId in package.classes:
            packageSize += self._compiler.getCompiledSize(classId, variants)
        self._console.outdent()

        return packageSize


    ##
    # Support for merging small packages.
    #
    # Small (as specified in the config) packages are detected, starting with 
    # those that are used by the least parts, and are merged into packages that
    # are used by the same and more parts.

    def collapsePartsBySize(self, script, minPackageSize, minPackageSizeForUnshared):

        if minPackageSize == None or minPackageSize == 0:
            return

        variants  = script.variants
        self._console.debug("")
        self._console.info("Collapsing parts by package sizes...")
        self._console.indent()
        self._console.debug("Minimum size: %sKB" % minPackageSize)
        self._console.indent()
        
        if minPackageSizeForUnshared == None:
            minPackageSizeForUnshared = minPackageSize

        # Start at the end with the sorted list
        # e.g. merge 4->7 etc.
        allPackages = script.packagesSortedSimple()
        allPackages.reverse()

        # make a dict {part.bit_mask: part}
        allPartBitMasks = {}
        [allPartBitMasks.setdefault(x.bit_mask, x) for x in script.parts.values()]

        oldpackages = set([])
        while oldpackages != set(script.packages):
            oldpackages = set(script.packages)
            allPackages = script.packagesSortedSimple()
            allPackages.reverse()
            
            # Test and optimize 'fromId'
            for fromPackage in allPackages:
                # possibly protect part-private package from merging
                if fromPackage.id in allPartBitMasks.keys():  # fromPackage.id == a part's bit mask
                    if allPartBitMasks[fromPackage.id].no_merge_private_package:
                        self._console.debug("Skipping private package #%s" % (fromPackage.id,))
                        continue
                packageSize = self._computePackageSize(fromPackage, variants) / 1024
                self._console.debug("Package #%s: %sKB" % (fromPackage.id, packageSize))
                # check selectablility
                if (fromPackage.part_count == 1) and (packageSize >= minPackageSizeForUnshared):
                    continue
                if (fromPackage.part_count > 1) and (packageSize >= minPackageSize):
                    continue

                # assert: the package is shared and smaller than minPackageSize
                #     or: the package is unshared and smaller than minPackageSizeForUnshared
                self._console.indent()
                mergedPackage, targetPackage = self._mergePackage(fromPackage, script, script.packages)
                if mergedPackage: # mergedPackage == fromPackage on success
                    script.packages.remove(fromPackage)

                self._console.outdent()

        self._console.outdent()
        self._console.outdent()



    def _getPreviousCommonPackage(self, searchPackage, packages):
        # get the "smallest" package (in the sense of _sortPackages()) that is 
        # in all parts searchPackage is in, and is earlier in the corresponding
        # packages lists

        def isCommonAndGreaterPackage(searchPackage, package):  
            # the next takes advantage of the fact that the package id encodes
            # the parts a package is used by. if another package id has the
            # same bits turned on, it is in the same packages. this is only
            # true for the searchId package itself and package id's that have
            # more bits turned on (ie. are "greater"); hence, and due to 
            # _sortPackages, they are earlier in the packages list of the
            # corresponding parts
            if searchPackage.id & package.id == searchPackage.id:
                return True
            return False

        ##
        # check if the deps of searchPackage have deps to targetPackage - 
        # if merging searchPackage into targetPackage, this would be creating
        # circular dependencies

        def noCircularDeps(searchPackage, targetPackage):
            for package in searchPackage.packageDeps:
                if targetPackage in package.packageDeps:
                    return False
            return True

        ##
        # check that the targetPackage is loaded in (at least) those parts
        # where searchPackage's deps are also loaded

        def depsAvailWhereTarget (searchPackage, targetPackage):
            for depsPackage in searchPackage.packageDeps:
                if not isCommonAndGreaterPackage(targetPackage, depsPackage):
                #if not targetPackage.id & depsPackage.id == targetPackage.id:
                    return False
            return True

        # ----------------------------------------------------------------------

        allPackages  = reversed(Package.simpleSort(packages))
                                # sorting and reversing assures we try "smaller" package id's first
        additional_constraints = self._jobconf.get("packages/additional-merge-constraints", False)

        for targetPackage in allPackages:
            if searchPackage.id == targetPackage.id:  # no self-merging ;)
                continue
            if not isCommonAndGreaterPackage(searchPackage, targetPackage):
                self._console.debug("Problematic #%d (different parts using)" % targetPackage.id)
                continue
            if not noCircularDeps(searchPackage, targetPackage):
                self._console.debug("Problematic #%d (circular dependencies)" % targetPackage.id)
                if additional_constraints:
                    continue
            if not depsAvailWhereTarget(searchPackage, targetPackage):
                self._console.debug("Problematic #%d (dependencies not always available)" % targetPackage.id)
                if additional_constraints:
                    continue
            yield targetPackage

        yield None


    ##
    # Support for collapsing parts along their expected load order
    #
    # Packages are merged in parts that define an expected load order, starting
    # with the boot part and continuing with groups of parts that have the same
    # load index, in increasing order. Within a group, packages are merged from
    # least used to more often used, and with packages unique to one of the parts
    # in the group to packages that are common to all parts.
    # Target packages for one group are blocked for the merge process of the next,
    # to avoid merging all packages into one "monster" package that all parts
    # share eventually.

    def collapsePartsByOrder(self, script, collapse_groups=None):
        
        def getCollapseGroupsOrdered(parts, ):
            # returns dict of parts grouped by collapse index
            # { 0 : set('boot'), 1 : set(part1, part2), 2 : ... }
            collapseGroups    = {}
            # boot part is always collapse index 0
            boot              = self._jobconf.get("packages/init", "boot")
            collapseGroups[0] = set((parts[boot],))

            for partname in parts:
                part = parts[partname]
                collidx = getattr(part, 'collapse_index', None)
                if collidx:
                    if collidx < 1 :  # not allowed
                        raise RuntimeError, "Collapse index must be 1 or greater (Part: %s)" % partname
                    else:
                        if collidx not in collapseGroups:
                            collapseGroups[collidx] = set(())
                        collapseGroups[collidx].add(part)

            return collapseGroups

        def isUnique(package, collapse_group):
            seen = 0
            for part in collapse_group:
                if package in part.packages:
                    seen += 1
                    if seen > 1:
                        return False
            return True

        def isCommon(package, collapse_group):
            seen = 0
            for part in collapse_group:
                if package in part.packages:
                    seen += 1
            return seen == len(collapse_group)

        def getUniquePackages(part, collapse_group, packages):
            uniques = {}
            for package in part.packages:
                if isUnique(package, collapse_group):
                    if (package.id == part.bit_mask and  # possibly protect "private" package
                        part.no_merge_private_package):
                        pass
                    else:
                        uniques[package.id] = package
            return uniques

        getUniquePackages.key = 'unique'

        def getCommonPackages(part, collapse_group, packages):
            commons = {}
            for package in part.packages:
                if isCommon(package, collapse_group):
                    commons[package.id] = package
            return commons

        getCommonPackages.key = 'common'


        def mergeGroupPackages(selectFunc, collapse_group, script, seen_targets):
            self._console.debug("collapsing %s packages..." % selectFunc.key)
            self._console.indent()
            curr_targets = set(())

            for part in collapse_group:
                #selected_packages = selectFunc(part, collapse_group, script.packages)
                oldpackages = []
                while oldpackages != part.packages:
                    oldpackages = part.packages[:]
                    for package in reversed(part.packagesSorted):   # start with "smallest" package
                        selected_packages = selectFunc(part, collapse_group, script.packages)
                                                # have to re-calculate, to account for modified script.packages
                        if package.id in selected_packages:
                            mergedPackage, targetPackage = self._mergePackage(package, script, selected_packages.values(), seen_targets)
                            if mergedPackage:   # on success == package
                                script.packages.remove(mergedPackage)
                                curr_targets.add(targetPackage)

            seen_targets.update(curr_targets)
            self._console.outdent()
            return script.parts, script.packages
        
        # ---------------------------------------------------------------------

        self._console.debug("")
        self._console.info("Collapsing parts by collapse order...")
        self._console.indent()

        if collapse_groups == None:
            collapse_groups = getCollapseGroupsOrdered(script.parts, )
        seen_targets    = set(())

        for collidx in sorted(collapse_groups.keys()): # go through groups in load order
            collgrp         = collapse_groups[collidx]
            self._console.debug("Collapse group %d %r" % (collidx, [x.name for x in collgrp]))
            self._console.indent()

            script.parts, script.packages = mergeGroupPackages(getUniquePackages, collgrp, script, seen_targets)
            script.parts, script.packages = mergeGroupPackages(getCommonPackages, collgrp, script, seen_targets)

            self._console.outdent()

        self._console.outdent()
        return


    def _mergePackage(self, fromPackage, script, packages, seen_targets=None):

        def updatePartDependencies(part, packageDeps):
            for package in packageDeps:
                if package not in part.packages:
                    # add package
                    part.packages.append(package)
                    # recurse
                    updatePartDependencies(part, package.packageDeps)
            return

        def mergeContAndDeps(fromPackage, toPackage):
            # Merging package content
            toPackage.classes.extend(fromPackage.classes)
            # Merging package dependencies
            depsDelta = fromPackage.packageDeps.difference(set((toPackage,))) # make sure toPackage is not included
            self._console.debug("Adding packages dependencies to target package: %r" % (sorted([x.id for x in depsDelta]),))
            toPackage.packageDeps.update(depsDelta)
            toPackage.packageDeps.difference_update(set((fromPackage,))) # remove potential dependency to fromPackage
            self._console.debug("Target package #%s now depends on: %r" % (toPackage.id, sorted([x.id for x in toPackage.packageDeps])))
            return toPackage

        # ----------------------------------------------------------------------

        self._console.debug("Search a target package for package #%s" % (fromPackage.id,))
        self._console.indent()
        # find toPackage
        toPackage = None
        for toPackage in self._getPreviousCommonPackage(fromPackage, packages):
            if toPackage == None:
                break
            elif seen_targets != None:
                if toPackage not in seen_targets:
                    break
            else:
                break
        if toPackage == None:
            self._console.outdent()
            return None, None
        self._console.debug("Merge package #%s into #%s" % (fromPackage.id, toPackage.id))
        self._console.indent()

        # Merge package content and dependencies
        toPackage = mergeContAndDeps(fromPackage, toPackage)

        # Update package dependencies:
        # all packages that depended on fromPackage depend now from toPackage
        for package in script.packages:
            if fromPackage in package.packageDeps:
                # replace fromPackage with toPackage
                package.packageDeps.difference_update(set((fromPackage,)))
                package.packageDeps.update(set((toPackage,)))

        # Update part information:
        # remove the fromPackage from all parts using it, and add new dependencies to part
        # using toPackage
        for part in script.parts.values():
            # remove the merged package
            if fromPackage in part.packages:
                # we can simply remove the package, as we know the target package is also there
                part.packages.remove(fromPackage)
            # check additional dependencies for all parts
            if toPackage in part.packages:
                # this could be a part method
                # if the toPackage is in part, we might need to add additional packages that toPackage now depends on
                updatePartDependencies(part, fromPackage.packageDeps)

        # remove of fromPackage from global packages list is easier handled in the caller
        
        self._console.outdent()
        self._console.outdent()
        return fromPackage, toPackage  # to allow caller check for merging and further clean-up fromPackage


    def _getFinalPartData(self, script):
        parts      = script.parts
        packageIds = [x.id for x in script.packagesSortedSimple()]

        resultParts = {}
        for toId, fromId in enumerate(packageIds):
            for partId in parts:
                if fromId in parts[partId].packages:
                    if not resultParts.has_key(partId):
                        resultParts[partId] = [toId]
                    else:
                        resultParts[partId].append(toId)

        return resultParts



    def _getFinalClassList(self, script):
        packages   = script.packagesSortedSimple()

        for package in packages:
            package.classes = self._depLoader.sortClasses(package.classes, script.variants, script.buildType)

        #script.packageIdsSorted = [x.id for x in packages]

        return script


    ##
    # <currently not used>

    def _sortPackagesTopological(self, packages): # packages : [Package]

        import graph
        
        # create graph object
        gr = graph.digraph()

        # add classes as nodes
        gr.add_nodes(packages)

        # for each load dependency add a directed edge
        for package in packages:
            for dep in package.packageDeps:
                gr.add_edge(package, dep)

        # cycle check?
        cycle_nodes = gr.find_cycle()
        if cycle_nodes:
            raise RuntimeError("Detected circular dependencies between packages: %r" % cycle_nodes)

        packageList = gr.topological_sorting()

        return packageList


    def _printPartStats(self, script):
        packages = dict([(x.id,x) for x in script.packages])
        parts    = script.parts

        packageIds = packages.keys()
        packageIds.sort()
        packageIds.reverse()

        self._console.debug("")
        self._console.debug("Package summary : %d packages" % len(packageIds))
        self._console.indent()
        for packageId in packageIds:
            self._console.debug("Package #%s contains %s classes" % (packageId, len(packages[packageId].classes)))
            self._console.debug("%r" % packages[packageId].classes)
            self._console.debug("Package #%s depends on these packages: %r" % (packageId, sorted([x.id for x in packages[packageId].packageDeps])))
        self._console.outdent()

        self._console.debug("")
        self._console.debug("Part summary : %d parts" % len(parts))
        self._console.indent()
        packages_used_in_parts = 0
        for part in parts.values():
            packages_used_in_parts += len(part.packages)
            self._console.debug("Part #%s packages(%d): %s" % (part.name, len(part.packages), ", ".join('#'+str(x.id) for x in part.packages)))

        self._console.debug("")
        self._console.debug("Total of packages used in parts: %d" % packages_used_in_parts)
        self._console.outdent()
        self._console.debug("")
