.. _pages/profiling#profiling_applications:

Profiling Applications
**********************

qooxdoo has build in a cross-browser, pure JavaScript profiler. If the profiler is enabled, each call of a method defined by qooxdoo's class declaration can be measured. The profiler is able to compute both the total own time and the call count of any method.

Since the profiler is implemented in pure JavaScript, it is totally cross-browser and works on any supported browser.

.. _pages/profiling#how_to_enable_the_profiler:

How to enable the Profiler
==========================

Basically set the variant ``qx.aspects`` to ``on`` and be sure to include the class `qx.dev.Profile <http://api.qooxdoo.org/#qx.dev.Profile>`_. The class should be included before other classes.

.. _pages/profiling#how_to_use_the_profiler:

How to use the Profiler
=======================

The profiler can be controlled either hard-wired in the application code (like the demo browser does for instance) or interactively using a JavaScript shell like FireBug for Firefox or DebugBar for IE.

Profiling a certain action:

* Open the application in your browser
* At the JavaScript console type ``qx.dev.Profile.stop()`` to clear the current profiling data gathered during startup
* Start profiling using ``qx.dev.Profile.start()``
* Perform the action you want to profile
* Stop profiling using ``qx.dev.Profile.stop()``
* Open the profiler output window: ``qx.dev.Profile.showResults(50)``. The parameter specifies how many items to display. Default value is set to 100. The output will be sorted by the total own time of each method. Alternatively you can work with the raw profiling data returned by ``qx.dev.Profile.getProfileData()``.

.. _pages/profiling#limitations:

Limitations
===========

In order to interpret the results correctly it is important to know the limitations of this profiling approach. The most significant limitation is due to the fact that the profiler itself is written in JavaScript and runs in the same context as the application:

* The profiler adds some overhead to each function call. The profiler takes this overhead into account in the calculation of the own time but there can still be a small inaccuracy.
* The result of ``new Date()``, which is used for timing, has a granularity of about 10ms on many patforms, so it is hard to measure especially small functions accurately.
* The application is slowed down because profiling is done by wrapping each function. Profiling should always be turned off in production code before deployment.
* Turning on profiling currently breaks most applications in Safari 3.0.2 due to a very limited maximum recursion depth of only 100 (`Bugzilla Bug 226 <http://bugzilla.qooxdoo.org/show_bug.cgi?id=226>`__). Since the profiler has to wrap each function, the call stack is doubled, which is just too much for Safari.

.. _pages/profiling#summary:

Summary
=======

The output of the profiler can be of great value to find hot spots and time-consuming code. The timing data should be interpreted rather qualitatively than quantitatively, though, due to constraints of this approach.

.. note::

    The application is slowed down because profiling is done by wrapping each function. Profiling should always be turned off in production code before deployment.

