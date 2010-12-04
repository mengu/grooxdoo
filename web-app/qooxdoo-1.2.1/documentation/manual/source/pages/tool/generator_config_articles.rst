.. _pages/tool/generator_config_articles#generator_configuration_articles:

Generator Configuration Articles
********************************

This page contains various articles related to the generator JSON configuration.

.. _pages/tool/generator_config_articles#path_names:

Path Names
==========

A lot of entries in a config file take path names as their values (top-level "include", "manifest" keys of a library entry, output path of compile keys, asf.).  Quite a few of them, like the top-level include paths, are interpreted **relative** to the config file in which they appear, and this relation is retained no matter from where you reference the config file. 

This might not hold true in each and every case, though. For some keys you might have to take care of relative paths yourself. The authoritative reference is always the corresponding documentation of the :doc:`individual config keys <generator_config_ref>`. If a key takes a path value it will state if and how these values are interpreted. Please check there.

A good help when dealing with paths is also to use macros, if you need to abstract away from a value appearing multiple times. E.g.

::

    "let" : {"MyRoot": ".", "BUILD_PATH" : "build"}
    "myjob" : { ... "build_dir" : "${MyRoot}/${BUILD_PATH}" ... }

This should make it more intuitive to maintain a config file.

.. note::

    **Implementor's note**:

    The configuration handler (``generator/config/Config.py``) handles relative paths in the obvious cases, like for the ``manifest`` entries in the ``library`` key, or in the top-level ``include`` key. But it cannot handle all possible cases, because it doesn't know beforehand which particluar key represents a path, and which doesn't. In a config entry like ``"foo" : "bar"`` it is hard to tell whether ``bar`` represents a relative file or directory. Therefore, part of the responsibility for relative paths is offloaded to the action implementations that make use of the particular keys.

    Since each config key, particularly action keys, interpret their corresponding config entries, they know which entries represent paths. To handle those paths correctly, the ``Config`` module provides a utility method ``Config.absPath(self, path)`` which will calculate the absolute path from the given path relative to the config file's location.


.. _pages/tool/generator_config_articles#file_globs:

File Globs
==========

Some config keys take file paths as their attributes. Where specified, *file globs* are allowed, as supported by the underlying Python module. File globs are file paths containing simple metacharacters, which are similar to but not quite identical with metacharacters from regular expressions. Here are the legal metacharacters and their meanings:

=================  ==================================================================================================================
 Metacharacter       Meaning                                                                                                           
=================  ==================================================================================================================
 \*                 matches any string of zero or more characters (regexp: .*)                                                         
 ?                  matches any single character (regexp: .)                                                                           
 []                 matches any of the enclosed characters; character ranges are possible using a hyphen, e.g. [a-z] (regexp: <same>)  
=================  ==================================================================================================================

.. _pages/tool/generator_config_articles#examples:

Examples
--------

Given a set of files like ``file9.js,  file10.js,  file11.js``, here are some file globs and their resolution:

==============  ====================================
File Glob        Resolution                           
==============  ====================================
 file*           file9.js,  file10.js and file11.js   
 file?.js        file9.js                             
 file1[01].js    file10.js and file11.js              
==============  ====================================

.. _pages/tool/generator_config_articles#class_data:

Class Data
==========

Besides code a qooxdoo application maintains a certain amount of data that represents some sort of resources. This might be negligible for small to medium size applications, but becomes significant for large apps. The resources fall roughly into two categories,

* **Internationalization (I18N) Data** This comprises two kinds of data:

  * translated strings
  * locale information (also CLDR data, such as currency, date and time formats, asf.)

* **File Resources**

  * static files like PNG and GIF graphics, but also HTML and CSS files, sound and multimedia files, asf.

Many of these resources need an internal representation in the qooxdoo app. E.g. translated strings are stored as key:value pairs of maps, and images are stored with their size and location. All this data requires space that shows up in  sizes of application files, as they are transfered from server to browser.

The build system allows you to tailor where those resources are stored, so you can optimize on your network consumption and memory footprint. Here is an overview:

  - **source** version:
    - without dedicated I18N parts:all class data is allocated in the loader
    - with dedicated I18N parts:class data is in dedicated I18N packages
  - **build** version:
    - without dedicated I18N parts: class data is allocated in each individual package, corresponding to the contained class code that needs it
    - with dedicated I18N parts: class data is in dedicated I18N packages

The term *"dedicated I18N parts"* refers to the possibility to split translated strings and CLDR data out in separate parts, one for each language (see :ref:`packages/i18n-with-boot <pages/tool/generator_config_ref#packages>`). Like with other parts, those parts have to be actively loaded by the application (using `qx.io.PartLoader.require <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.io.PartLoader>`_).

In the build version without dedicated I18N parts (case 2.1), those class data is stored as is needed by the code of the package. This may mean that the same data is stored in multiple packages, as e.g. two packages might use the same image or translated string. This is to ensure optimal independence of packages among each other so they can be loaded independently, and is resolved at the browser (ie. resource data is stored uniquely in memory).

.. _pages/tool/generator_config_articles#cache_key:

"cache" Key
===========

.. _pages/tool/generator_config_articles#compile_cache:

Compile cache
-------------

The main payload of the ``:ref:`cache <pages/tool/generator_config_ref#cache_key>``` key is to point to the directory for the compile cache. It is very recommendable to have a system-wide compile cache directory so cache contents can be shared among different projects and libraries. Otherwise, the cache has to be rebuilt in each enviornment anew, costing extra time and space.

The default for the cache directory is beneath the system TMP directory. To find out where this is either run a build job with the ``-v`` command line flag and look for the *cache* key in the expanded job definition, or use this :ref:`snippet <pages/snippets#finding_your_system-wide_tmp_directory>`.

The compile cache directory can become very large in terms of contained files, and a count of a couple of thousand files is not unusual. You should take care that your file system is equipped to comply with these demands. Additionally, disk I/O is regularly high on this directory so a fast, local disk is recommendable. Don't use a network drive :-) .

A word of advice is also in place for the time being: Cache management is not optimal currently. If you experience strange results or error messages during development, deleting the cache directory is sometimes the necessary and sufficient cure. We hope to improve this in the future.

.. _pages/tool/generator_config_articles#let_key:

"let" Key
=========

Config files let you define simple macros with the ``let`` key. The value of a macro can be a string or another JSON-permissible value (map, array, ...). You refer to a macro value in a job definition by using ``${<macro_name>}``. 

::

    "let": {"MyApp" : "demobrowser"}
      ...
      "myjob" : { "settings" : {"qx.application" : "${MyApp}.Application"}}

If the value of the macro is a string you can use a reference to it in other strings, and the macro reference will be replaced by its value. You can have multiple macro references in one string. Usually, these macro references will show up in map values or array elements, but can also be used in map keys.

::

    "myjob" : {"${MyApp}.resourceUri" : "resource"}

If the value of the macro is something other than a string, things are a bit more restrictive. References to those macros can not be used in map keys (for obvious reasons). The reference has still to be in a string, but the macro reference has to be **the only contents** of that string. The entire string will then be replaced by the value of the macro. That means, you can do something like this:

::

    "let" : {"MYLIST" : [1,2,3], ...},
      "myjob" : { "joblist" : "${MYLIST}", ...}

and the "joblist" key will get the value [1,2,3].

A special situation arises if you are using a **top-level let**, i.e. a *let* section on the highest level in the config file, and not in any job definition. This *let* map will be automatically applied to every job run, without any explicit reference (so be aware of undesired side effects of bindings herein). 

When assembling a job to run, the precedence of all the various *let* maps is 

::

    local job let < config-level let < 'extend' job lets

With imported jobs top-level definitions will take precedence over any definitions from the external config file (as if they were the 'first' let section in the chain).

.. _pages/tool/generator_config_articles#log_key:

"log" Key
=========

Logging is an important part of any reasonably complex application. The Generator does a fair bit of logging to the console by default, listing the jobs it performs, adding details of important processing steps and reporting on errors and potential inconsistencies. The ``:ref:`log <pages/tool/generator_config_ref#log>``` key lets you specify further options and tailor the Generator console output to your needs. You can e.g. add logging of unused classes in a  particular library/name space.

.. _pages/tool/generator_config_articles#extend_key:

"extend" Key
============

.. _pages/tool/generator_config_articles#job_resolution:

Job resolution
--------------

``extend`` and ``run`` keywords are currently the only keywords that reference other jobs. These references have to be resolved, by looking them up (or "evaluating" the names) in some context. One thing to note here is that job names are evaluated **in the context of the current job map**. As you will see (see section on :ref:`top-level "include"s <pages/tool/generator_config_articles#include_key_top-level_-_adding_features>`), a single configuration might eventually contain jobs from multiple config files, the local job definitions, and zero to many imported job maps (from other config files), which again might contain imported configs. From within any map, only those jobs are referenceable that are **contained** somewhere in this map. Unqualified names (like "myjob") are taken to refer to jobs on the same level as the current job, path-like names (containing "/") are taken to signify a job in some nested name space down from the current level. Particularly, this means you can never reference a job in a map which is "parallel" to the current job map. It's only jobs on the same level or deeper.

This is particularly important for imported configs (imported with a top-level "include" keyword, see further :ref:`down <pages/tool/generator_config_articles#include_key_top-level_-_adding_features>`). Those configs get attached to the local "jobs" map under a dedicated key (their "name space" if you will). If in this imported map there is a "run" job (see the :ref:`next section <pages/tool/generator_config_articles#extending_jobs>`) using unqualified job names, these job names will be resolved using the imported map, not the top-level map. If the nested "run" job uses path-like job names, these jobs will be searched for **relative** to the nested map. You get it?!

.. _pages/tool/generator_config_articles#extending_jobs:

Extending jobs
--------------

Now, how exactly is a job (let's call this the primary job) treated that says to "extend" another job (let's call this the secondary job). Here is what happens:

* The primary job provides sort of the master definition for the resulting job. All its definitions take precedence.
* The secondary job is searched in the context of the current "jobs" map (see above).
* Keys of the secondary job that are **not** available in the primary job are just added to the job definition.
* Keys of the secondary job that are already present in the primary job and have a scalar value (string, number, boolean) are **discarded**.
* Keys of the secondary job that are already present in the primary job and have a list or map value are **merged**. The extending rules are applied on the element level recursively, i.e. scalar elements are blocked, new elements are added, composed element are merged. That means, those keys accumulate all their inner keys over all jobs in the transitive hull of all extend jobs of the primary job.
* There is a way of **preventing** this kind of merge behaviour: If you prefix a job key with an equal sign (``=``) no subsequent merging will be done on this key. That means all following jobs that are merged into the current will not be able to alter the value of this key any more.
* Obviously, each secondary job is extended itself **before** being processed in this way, so it brings in its own full definition. As stated before it is important to note that this extending is done in the secondary job's **own** context, which is not necessarily the context of the primary job.
* If there are more than one job in the "extend" list, the process is re-applied **iteratively** with all the remaining jobs in the list. This also means that the list of secondary jobs defines a precedence list: Settings in jobs earlier in the list take precedence over those coming later, so order matters.

Important to note here: **Macro evaluation** takes place only **after** all extending has been done. That is, macros are applied to the fully extended job, making all macro definitions available that have accumulated along the way, with a 'left-to-right' precedence (macro definitions in the primary job take precedence over definitions in secondary jobs, and within the list of secondary jobs, earlier jobs win over subsequent). But in contrast to job names that also means that macros are explicitly **not** evaluated in the original context of the job. This makes it possible to tweak a job definition for a new environment, but can also lead to surprises if you wanted to have some substitution taking place in the original config file, and realize it doesn't.

.. _pages/tool/generator_config_articles#job_shadowing_and_partial_overriding:

Job Shadowing and Partial Overriding
------------------------------------

Additionally to the above described features, with the configuration system you can

* create jobs in your local configuration with *same names* as those imported from another configuration file. The local job will take precedence and "shadow" the imported job; the imported job gets automatically added to the local job's ``extend`` list.
* extend one job by another by only *partially specifying* job features. The extending job can specify only the specific parts it wants to re-define. The jobs will then be merged as described above, giving precedence to local definitions of simple data types and combining complex values (list and maps); in the case of maps this is a deep merging process. Here is a sample of overriding an imported job (``build-script``), only specifying a single setting, and relying on the rest to be provided by the imported job of same name::

      "build-script" : {
        "compile-options" : {
          "code" : {
            "format" : true
          }
        }
      }

You can again use ``=`` to control the merging:

* *selectively block* merging of features by using ``=`` in front of the key name, like::

    ...
      {
        "=open-curly" : ...,
        ...
      }
    ...

* override an imported job *entirely* by guarding the local job with ``=`` like::

    "jobs" : {
      "=build-script" : {...},
      ...
    }

.. _pages/tool/generator_config_articles#run_key:

"run" Key
=========

"run" jobs are jobs that bear the ``run`` keyword. Since these are kind of meta jobs and ment to invoke a sequence of other jobs, they have special semantics. When a ``run`` keyword is encountered in a job, for each sub-job in the "run" list a new job is generated (so called *synthetic jobs*, since they are not from the textual config files). For each of those new jobs, a job name is auto-generated using the initial job's name as a prefix. As for the contents, the initial job's definition is used as a template for the new job. The ``extend`` key is set to the name of the current sub-job (it is assumed that the initial job has been expanded before), so the settings of the sub-job will eventually be included, and the "run" key is removed. All other settings from the initial job remain unaffected. This means that all sub-jobs "inherit" the settings of the initial job (This is significant when sub-jobs evaluate the same key, and maybe do so in a different manner).

In the overall queue of jobs to be performed, the initial job is replaced by the list of new jobs just generated. This process is repeated until there are no more "run" jobs in the job queue, and none with unresolved "extend"s.

.. _pages/tool/generator_config_articles#asset-let_key:

"asset-let" Key
===============

The ``asset-let`` key is basically a :ref:`macro <pages/tool/generator_config_articles#let_key>` definition for ``#asset`` compiler hints, but with a special semantics. Keys defined in the "asset-let" map will be looked for in *#asset* hints in source files. Like with macros, references have to be in curly braces and prefixed with ``$``. So a "asset-let" entry in the config might look like this:

::

    "asset-let" :
      {
        "qx.icontheme" : ["Tango", "Oxygen"],
        "mySizes" : ["16", "32"]
      }

and a corresponding *#asset* hint might use it as:

::

    #asset(qx/icon/${qx.icontheme}/${mySizes}/*)

The values of these macros are lists, and each reference will be expanded into all possible values with all possible combinations. So the above asset declaration would essentially be expanded into:

::

    #asset(qx/icon/Tango/16/*)
    #asset(qx/icon/Tango/32/*)
    #asset(qx/icon/Oxygen/16/*)
    #asset(qx/icon/Oxygen/32/*)

.. _pages/tool/generator_config_articles#library_key_and_manifest_files:

"library" Key and Manifest Files
================================

The ``:ref:`pages/tool/generator_config_ref#library``` key of a configuration holds information about source locations that will be considered in a job (much like the CLASSPATH in Java). Each element specifies one such library. The term "library" is meant here in the broadest sense; everything that has a qooxdoo class structure with source code can be considered a library in this context. This includes applications like the Showcase or the Feedreader, add-ins like the Testrunner or the Apiviewer, contribs from the qooxdoo-contrib repository like the Inspector, or of course the qooxdoo framework library itself. The main purpose of any such library entry is to provide the path to its "Manifest" file.

.. _pages/tool/generator_config_articles#manifest_files:

Manifest files
--------------

Manifest files serve to provide meta information for a library in a structured way. Their syntax is again JSON, and part of them is read by the generator, particularly the ``provides`` section. See :doc:`here </pages/getting_started/manifest>` for more information about manifest files.

.. _pages/tool/generator_config_articles#contrib_libraries:

Contrib libraries
-----------------

Contributions can be included in a configuration like any other libraries: You add an appropriate entry in the ``library`` array of your configuration. Like other libraries, the contribution must provide a :doc:`Manifest.json </pages/getting_started/manifest>` file with appropriate contents.

If the contribution resides on your local file system, there is actually no difference to any other library. Specify the relative path to its Manifest file and you're basically set. The really new part comes when the contribution resides online, in the `qooxdoo-contrib <http://qooxdoo.org/contrib>`_ repository. Then you use a special syntax to specify the location of the Manifest file. It is URL-like with a ``contrib`` scheme and will usually look like this:

::

    contrib://<ContributionName>/<Version>/<ManifestFile>

The contribution source tree will then be downloaded from the repository, the generator will adjust to the local path, and the contribution is then used just like a local library. A consideration that comes into play here is the question where to put the files locally:

  * The default location is a subdirectory from your project folder named ``cache-downloads``. This has to be reflected in the ``uri`` parameter of the library entry.

So, for example an entry for the "trunk" version of the "HtmlArea" contribution with default download location would look like this:

::

    {
      "manifest" : "contrib://HtmlArea/trunk/Manifest.json",
      "uri"          : "../cache-downloads/HtmlArea/trunk"
    }

  * Mind that the ``uri`` parameter reflects the path from your application's ``index.html`` to the local root directory of the contribution (wherever that is in your particular case).

  * You can configure a different download directory using the ``:ref:`pages/tool/generator_config_ref#cache`/downloads`` key. If this key is specified the given path will be used as root directory for the downloaded contribs. Again, remember to reflect this path in the ``uri`` key of your contrib library entry.

.. _pages/tool/generator_config_articles#uri_handling:

URI handling
------------

URIs are used in a qooxdoo application to refer from one part to other parts like resources. There are places within the generator configuration where you can specify *uri* parameters. What they mean and how this all connects is explained in this section.

.. _pages/tool/generator_config_articles#where_uris_are_used:

Where URIs are used
^^^^^^^^^^^^^^^^^^^

The first important thing to note is:

.. note::

    All URI handling within qooxdoo is related to libraries.

Within qooxdoo the :ref:`library <pages/tool/generator_config_articles#library_key_and_manifest_files>` is a fundamental concept, and libraries in this sense contain all the things you are able to include in the final Web application, such as
class files (.js),
graphics (.gif, .png, ...),
static HTML pages (.htm, .html),
style sheets (.css),
and translation files (.po).

But not all of the above resource types are actually referenced through URIs in the application. Among those that are you find in the **source** version:

* references to class files
* references to graphics
* references to static HTML
* references to style sheet files

The **build** version uses a different approach, since it strives to be a self-contained Web application that has no outgoing references. Therefore, all necessary resources are copied over to the build directory tree. Having said that, URIs are still used in the build version, yet these are only references confined to the build directory tree:
  * JS class code is put into the (probably various) output files of the generator run (what you typically find under *build/script/*.js*). The bootstrap file references the others with relative URIs.
  * Graphics and other resources are referenced with relative URIs from the compiled scripts. Those resources are typically found under the *build/resource* path.
  * Translation strings and CLDR information can be directly included in the bootstrap file (where they need not be referenced through URIs, the default), or be put in separate files (where they have to be referenced).

So, in summary, in the *build* version some references might be resolved by directly including the specific information, while the remaining references are usually confined to the build directory tree. That is why you can just pack it up and copy it to your web server for deployment. The *source* version is normally used directly off of  the file system, and employs relative URIs to reference all necessary files. Only in cases where you e.g. need to include interaction with a backend you will want to run the source version from a web server environment. For those cases the following details will be especially interesting. Others might want to skip the remainder of this section for now.

Although the scope and relevance of URIs vary between *source* and *build* versions, the underlying mechanisms are the same in both cases, with the special twist that when creating the *build* version there is only a single "library" considered, the build tree itself, which suffices to get all the URIs out fine. These mechanisms  are described next.

.. _pages/tool/generator_config_articles#construction_of_uris_through_the_generator:

Construction of URIs through the Generator
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

So how does the generator create all of those URIs in the final application code? All those URIs are constructed through the following three components:

::

    to_libraryroot  + library_internal_path + resource_path
           [1]                [2]                 [3]

So for example a graphics file in the qooxdoo framework might get referenced using the following components 

* [1] *"../../qooxdoo-1.2-sdk/framework/"* 
* [2] *"source/resource/qx/"*
* [3] *"icon/Oxygen/16/actions/go-up.png"*

to produce the final URI *"../../qooxdoo-1.2-sdk/framework/source/resource/qx/icon/Oxygen/16/actions/go-up.png"*.

These general parts have the following meaning:

* **[1]** : URI path to the library root (as will be valid when running the app in the browser). If you specify the :ref:`uri <pages/tool/generator_config_ref#library>` parameter of the library's entry in your config, this is what gets used here.
* **[2]** : Path segment within the specific library. This is taken from the library's :doc:`Manifest.json </pages/getting_started/manifest>`. The consumer of the library has no influence on it.
* **[3]** : Path segment leading to the specific resource. This is the path of the resource as found under the library's resource root directory.

.. _pages/tool/generator_config_articles#library_base_uris_in_the_source_version:

Library base URIs in the Source version
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Part *[1]* is exactly what you specify with the *uri* subkey of an entry in the *library* key list. This should be fine for most applications. All *source* jobs of the generator using this library will then be using this URI prefix to reference resources of that library. (This is usually fine, as long as you don't have different autonomous parts in your application using the same library from different directories; see also further down).

If you don't specifying the *uri* key with your libraries (which is usually the case), the generator will calculate a value for *[1]*, using the following information:

::

    applicationroot_to_configdir + configdir_to_libraryroot
                [1.2]                      [1.2]

The parts have the following meaning:

* **[1.2]** : Path from the Web application's root to the configuration file's directory; this information is derived from the *paths/app-root* key of the :ref:`pages/tool/generator_config_ref#compile-options` config key.
* **[1.2]** : Path from the configuration file's directory to the root directory of the library (the one containing the *Manifest.json* file); this information is immediately available from the library's :ref:`manifest <pages/tool/generator_config_ref#library>` key.

For the **build** version, dedicated keys :ref:`uris/script <pages/tool/generator_config_ref#compile-options>` and  :ref:`uris/resource <pages/tool/generator_config_ref#compile-options>` are available (as there is virtually only one "library"). The values of both keys cover the scope of components [1] + [2] in the first figure.

Since *[1.2]* is always known (otherwise the whole library would not be found), only *[1.2]* has to be given in the config. The features of this approach, in contrast to specifying *[1]*, are:

* **The application root can be specified individually for each compile job.** This means you could have more than one application root in your project, e.g. when your main application offers an iframe, into which another application from the same project is loaded; qooxdoo's `Demobrowser <http://demo.qooxdoo.org/1.2.x/demobrowser>`_ application takes advantage of exactly that.
* **Relative file system paths have to match with relative URIs in the running application.** So this approach won't work if e.g the relative path from your config directory to the library makes no sense when the app is run from a web server.

From the above discussion, there is one important point to take away, in order to create working URIs in your application:

.. note::

    You have to either specify the library's *uri* parameter ([1]) or the URI-relevant keys in the compile jobs (*root*, *script*, *resource*)  in your config.

While either are optional in their respective contexts, it is mandatory to *at least* specify one of them for the URI generation to work.

.. _pages/tool/generator_config_articles#overriding_the_uri_settings_of_libraries:

Overriding the 'uri' settings of libraries
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Libraries you specify in your own config (with the :ref:`library <pages/tool/generator_config_ref#library>` key) are in your hand, and you can provide ``uri`` parameters as you see fit. If you want to tweak the "uri" setting of a library entry that is added by including another config file (e.g. the default *application.json*), you simply re-define the library entry of that particular library locally. The generator will realize that both entries refer to the same library, and your local settings will take precedence.

You can specify ``library`` keys in your own config in these ways:

* You either define a local job which either shaddows or "extends" an imported job, and provide this local job with a ``library`` key. Or,
* You define a local ``"libraries"`` job and provide it with a "library" key. This job will be used automatically by most of the standard jobs (source, build, etc.), and thus your listed libraries will be used in multiple jobs (not just one as above).

.. _pages/tool/generator_config_articles#packages_key:

"packages" Key
==============

For a general introduction to parts and packages see this separate :doc:`document </pages/development/parts_overview>`. Here is more information on specifics of the :ref:`pages/tool/generator_config_ref#packages` config key.

.. _pages/tool/generator_config_articles#parts/<part_name>/include:

parts/<part_name>/include
-------------------------

The way the part system is currently implemented has some caveats in the way *parts/*/include* keys and the general :ref:`pages/tool/generator_config_ref#include` key interact:

a) The general "include" key, i.e. the class list with all dependencies fully expanded, provides the "master list" of classes for the given application. All classes given in the part "include"s, including all their dependencies, are checked against this list. If any of those classes is not in the master list, it will not be included in the app.

Therefore, you cannot include classes in parts that are not covered by the  general "include". If you want to use e.g. "qx.bom.*" in a part, you have to  add "qx.bom.*" to the general "include" list. Otherwise, only classes within  qx.bom.* that actually derive from the general include key will be actually  included, and the rest will be discarded. Motto:

*"The general include key is a filter for all classes in parts."*

b) Any class that is in the master list that is never listed in one of the  parts, either directly or as dependency, will not be included in the app. That  means you have to **actively** make sure that all classes from the general "include" get - directly or indirectly - listed in one of the parts, or they  will not be in the final app. Motto:

*"The parts' include keys are a filter for all classes in the general include  key."*

Or, to put both aspects in a single statement: The classes in the app are  exactly those in the **intersection** of the classes defined through the general  "include" key and all the classes defined by the "include" keys of the parts. Currently, the application developer has to make sure that they match, ie. that  the classes specified through the parts together sum up to the global class  list!

There is another caveat that concerns the relation between "include"s of  different parts:

c) Any class that is listed in a part's "include" (file globs expanded) will  not be included in another part. - But this also means that if two parts list  the same class, it won't be included in either of them!

This is e.g. the case in a sample application, where the *boot* part lists 'qx.bom.client.Engine' and the *core* part lists 'qx.bom.*' which also expands to qx.bom.client.Engine eventually. That's the reason why qx.bom.client.Engine would not be contained in the final application at all.

.. _pages/tool/generator_config_articles#i18n-with-boot:

i18n-with-boot
--------------

Setting this sub-key to *false* will result in I18N information (translations, CLDR data, ...) being put in their own separate parts. The utility of this is:

* The loader package gets smaller, which allows for faster application startup
* You can handle I18N data more individually

Here are the details:

* By default, I18N data, i.e. translations from the .po files and CLDR data, is integrated as Javascript data in the application loader (which in turn is per default integrated with the first package, the boot package, but that's a different story).
* Setting *packages/i18n-with-boot: false* removes this data from the loader script.
* Rather, data for *each individual locale* (en, en_US, de, de_DE, ...) will be collated in a dedicated *part*, the part name being that of the respective language code. As usual, each part is made up of packages. In the case of an I18N part, these are the corresponding data package plus fall-back packages for key lookup (e.g. ["C", "en", "en_US"] for the part "en_US"). Each package is a normal qooxdoo package with only the data section, and without the code section. (See :doc:`/pages/development/parts_overview` for more details).

So far, so good. This is the point where the application developer has to take over. The application will not load the I18N parts by itself. You have to do it using the usual part loading API (e.g. ``qx.io.PartLoader.require(["en_US"])``). You might want to do that early in the application run cycle, e.g. during application start-up and before the first translateable string or localizable data is to be converted. After loading the part, the corresponding locale is ready to be used in the normal way in your application. The `Feedreader <http://demo.qooxdoo.org/1.2.x/feedreader>`_ application uses this technique to load a different I18N part when the language is changed in its *Preferences* dialog.

.. _pages/tool/generator_config_articles#include_key_top-level_-_adding_features:

"include" Key (top-level) - Adding Features
===========================================

Within qooxdoo there are a couple of features that are not so much applications although they share a lot of the classical application structure. The APIViewer and TestRunner are good examples for those. (In the recent repository re-org, they have been filed under *component* correspondingly). They are applications but receive their actual meaning from other applications: An APIViewer in the form of class documentation it presents, the TestRunner in the form of providing an environment to other application's test classes. On their own, both applications are "empty", and the goal is it to use them in the context of another, self-contained application. The old build system supported make targets like 'api' and 'test' to that end.

While you can always include other applications' *classes* in your project (by adding an entry for them to the :ref:`library <pages/tool/generator_config_ref#library>` key of your config), you wouldn't want to repeat all the necessary job entries to actually build this external app in your environment. So the issue here is not to re-use classes, but *jobs*.

.. _pages/tool/generator_config_articles#re-using_jobs:

Re-using jobs
-------------

So, the general issue we want to solve is to import entire job definitions in our local configuration. The next step is then to make them work in the local environment (e.g. classes have to be compiled and resources be copied to local folders). This concepts is fairly general and scales from small jobs (where you just keep their definition centrally, in order to use them in multiple places) to really big jobs (like e.g. creating a customized build version of the Apiviewer in your local project).

Practically, there are two steps involved in using external jobs:

#. You have to :ref:`include <pages/tool/generator_config_ref#include_top-level>` the external configuration file that contains the relevant job definitions. Do so will result in the external jobs being added to the list of jobs of your local configuration. E.g. you can use ::

    generator.py ?

   to get a list of all available jobs; the external jobs will be among this list.
#. There are now two way to utilize these jobs:

  * You can either invoke them directly from the command line, passing them as arguments to the generator.
  * Or you define local jobs that :ref:`extend <pages/tool/generator_config_ref#extend>` them.

In the former case the only way to influence the behaviour of the external job is through macros: The external job has to parameterize its workings with macro references, you have to know them and provide values for them that are suitable for your environment (A typical example would be output paths that you need to customize). Your values will take precendence over any values that might be defined in the external config. But this also means you will have to know the job, know the macros it uses, provide values for them (e.g. in the global :ref:`let <pages/tool/generator_config_ref#let_top-level>` of your config), resolve conflicts if other jobs happen to use the same macros, and so forth. 

In the latter case, you have more control over the settings of the external job that you are actually using. Here as well, you can provide macro definitions that parameterize the behaviour of the job you are extending. But you can also supply more job keys that will either shaddow the keys of the same name in the external job, or will be extended by them. In any case you will have more control over the effects of the external job.

Add-ins use exactly these mechanisms to provide their functionality to other applications (in the sense as 'make test' or 'make api' did it in the old system). Consequently, to support this in the new system, the add-in applications (or more precisely: their job configuration) have to expose certain keys and use certain macros that can both be overridden by the using application. The next sections describe these build interfaces for the various add-in apps. But first more practical detail about the outlined ...

.. _pages/tool/generator_config_articles#add-in_protocol:

Add-In Protocol
---------------

In order to include an add-in feature in an existing app, you first have to ``include`` its job config. On the top-level of the config map, e.g. specify to include the Apiviewer config:

::

    "include" : [{"path": "../apiviewer/config.json"}]

The include key on this level takes an array of maps. Each map specifies one configuration file to include. The only mandator key therein is the file path to the external config file (see :ref:`here <pages/tool/generator_config_ref#include_top-level>` for all the gory details). A config can only include what the external config is willing to :ref:`export <pages/tool/generator_config_ref#export>`. Among those jobs the importing config can select (through the ``import`` key) or reject (through the ``block`` key) certain jobs. The resulting list of external job definitions will be added to the local jobs map.

If you want to fine-tune the behaviour of such an imported job, you define a local job that extends it. Imported jobs are referenced like any job in the current config, either by their plain name (the default), or, if you specify the ``as`` key in the include, by a composite name ``<as_value>::<original_name>``. Suppose you used an ``"as" : "apiconf"`` in your include, and you wanted to extend the Apiviewer's ``build-script`` job, this could look like this:

::

    "myapi-script" :
    {
      "extend" : ["apiconf::build-script"]
      ...
    }

As a third step, the local job will usually have to provide additional information for the external job to succeed. Which exactly these are depends on the add-in (and should eventually be documented there). See the section specific to the :ref:`APIViewer <pages/tool/generator_config_articles#api_viewer>` for a concrete example.

.. _pages/tool/generator_config_articles#api_viewer:

API Viewer
----------

For brevity, let's jump right in into a config fragment that has all necessary ingredients. These are explained in more detail afterwards.

::

    {
      "include" : [{"as" : "apiconf", "path" : "../apiviewer/config.json"}],
      "jobs" : {
        "myapi" : {
            "extend" : ["apiconf::build"],
            "let" : {
                "ROOT"  :  "../apiviewer",
                "BUILD_PATH" : "./api",
                "API_INCLUDE" : ["qx.*", "myapp.*"],
                "API_EXCLUDE" : ["myapp.tests.*"]
                },
            "library" : { ... },
            "settings" : {
                "myapp.resourceUri" : "./resource"
                }
            }
        }
    }

The ``myapi`` job extends the ``build`` job of APIViewer's job config. This "build" job is itself a run job, i.e. it will be expanded in so many individual jobs as its ``run`` key lists. All those jobs will get the "myapi" job as a context into which they are expanded, so all other settings in "myapi" will be effective in those jobs.

In the ``let`` key, the ROOT, BUILD_PATH, API_INCLUDE and API_EXCLUDE macros of the APIViewer config are overridden. This ensures the APIViewer classes are found, can be processed, and the resulting script is put into a local directory. Furthermore, the right classes are included in the documentation data.

The ``library`` key has to at least add the entry for the current application, since this is relevant for the generation of the api documentation for the local classes.

So in short, the ``ROOT``, ``BUILD_PATH``, ``API_INCLUDE`` and ``API_EXCLUDE`` macros define the interface between the apiviewer's "run" job and the local config.

.. _pages/tool/generator_config_articles#optimize_key:

"optimize" Key
==============

The *optimize* key is a subkey of the :ref:`compile-options key<pages/tool/generator_config_ref#compile>`. It allows you to tailor the forms of code optimization that is applied to the Javascript code when the *build* version is created. Currently, there are four categories which can be optimized.

.. _pages/tool/generator_config_articles#strings:

**strings**
  With string optimization, strings are extracted from the class definition and put into lexical variables. The occurrences of the strings in the class definition is then replaced by the variable name. This mainly benefits IE6 and repetitive references to the same string literal.

.. _pages/tool/generator_config_articles#variables:

**variables**
  Long variable names are made short. Lexical variables (those declared with a *var* statement) are replaced by generated names that are much shorter (1-2 characters on average). Dependending on the original code, this can result in significant space savings.

.. _pages/tool/generator_config_articles#privates:

**privates**
  This is less an optimization in space or time, but rather a way to enforce privates. Private members of a class (those beginning with "__") are replaced with generated names, and are substituted throughout the class. If some other class is accessing those privates, these references are not updated and will eventually fail when the access happens. This will lead to a runtime error.

.. _pages/tool/generator_config_articles#basecalls:

**basecalls**
  Calls to :ref:`this.base() <pages/classes#inheritance>`, which invoke the corresponding superclass method, are inlined, i.e. the superclass method call  is inserted in place of the this.base() call.

