.. _pages/layout/grid#grid:

Grid
****
The grid layout manager arranges the items in a two dimensional grid. Widgets can be placed into the grid's cells and may span multiple rows and columns.

.. _pages/layout/grid#preview_image:

Preview Image
-------------

|layout/grid.png|

.. |layout/grid.png| image:: /pages/layout/grid.png

This image show two nested grids with column and row spans.

.. _pages/layout/grid#features:

Features
--------
* Flex values for rows and columns
* Minimal and maximal column and row sizes
* Manually setting of column and row sizes
* Horizontal and vertical alignment
* Horizontal and vertical spacing
* Column and row spans
* Auto-sizing

.. _pages/layout/grid#description:

Description
-----------

The grid arranges the child widgets in a two dimensional grid. Each child is associated with a grid ``column`` and ``row``. Widgets can span multiple cells by setting the ``colSpan`` and ``rowSpan`` layout properties. However each grid cell can only contain one widget. Thus child widgets can never overlap.

The grid computes the preferred with/height of each column/row based on the preferred size of the child widgets. The computed column widths and row heights can be overridden by explicitly setting them using `setColumnWidth <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.layout.Grid~setColumnWidth>`_ and `setRowHeight <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.layout.Grid~setRowHeight>`_. Minimum and maximum sizes for columns/rows can be set as well.

By default no column or row is stretched if the available space is larger/smaller than the needed space. To allow certain rows/columns to be stretched each row/column can have a :ref:`flex <pages/ui_layouting#flex>` value.

.. _pages/layout/grid#layout_properties:

Layout properties
-----------------
* **row** *(Integer)*: The row of the cell the widget should occupy. Each cell can only contain one widget. This layout  property is mandatory.
* **column** *(Integer)*: The column of the cell the widget should occupy. Each cell can only contain one widget. This layout property is mandatory.
* **rowSpan** *(Integer)*: The number of rows, the widget should span, starting from the row specified in the ``row`` property. The cells in the spanned rows must be empty as well. (defaults to ``1``)
* **colSpan** *(Integer)*: The number of columns, the widget should span, starting from the column specified in the ``column`` property. The cells in the spanned columns must be empty as well. (defaults to ``1``)

.. _pages/layout/grid#alternative_names:

Alternative Names
-----------------
* `QGridLayout <http://doc.trolltech.com/4.3/qgridlayout.html>`_ (Qt)
* Grid (XAML)
* TableLayout (ExtJS)

.. _pages/layout/grid#demos:

Demos
-----
Here are some links that demonstrate the usage of the layout:

* `Simple grids <http://demo.qooxdoo.org/1.2.x/demobrowser/#layout-Grid_Simple.html>`_
* `Complex grids <http://demo.qooxdoo.org/1.2.x/demobrowser/#layout-Grid_Complex.html>`_
* `A grid with different cell alignments <http://demo.qooxdoo.org/1.2.x/demobrowser/#layout-Grid_Alignment.html>`_
* `An animated grid <http://demo.qooxdoo.org/1.2.x/demobrowser/#layout-Grid_Animated.html>`_

.. _pages/layout/grid#api:

API
---
| Here is a link to the API of the layout manager:
| `qx.ui.layout.Grid <http://demo.qooxdoo.org/1.2.x/apiviewer/index.html#qx.ui.layout.Grid>`_

