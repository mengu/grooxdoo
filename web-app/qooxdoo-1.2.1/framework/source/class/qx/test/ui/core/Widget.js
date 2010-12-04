/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.core.Widget",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testIsTabable : function()
    {
      var widget = new qx.ui.core.Widget().set({
        focusable: true
      });

      this.assertFalse(widget.isTabable(), "Non rendered widgets are not tabable");

      this.getRoot().add(widget);
      this.flush();
      this.assertTrue(widget.isTabable(), "Rendered focusable widgets are tabable");

      widget.setFocusable(false);
      this.assertFalse(widget.isTabable(), "Non focusable widgets are not tabable");

      widget.destroy();
    },


    testIsSeeableDepth0AfterFlush : function()
    {
      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      w.hide();
      this.flush();

      this.assertFalse(w.isSeeable());

      w.destroy();
    },


    testIsSeeableDepth1AfterFlush : function()
    {
      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      this.getRoot().add(c);
      var w = new qx.ui.core.Widget();
      c.add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      c.hide();
      this.flush();

      this.assertFalse(w.isSeeable());

      l.dispose();
      w.destroy();
      c.destroy();
    },


    testIsSeeableDepth2AfterFlush : function()
    {
      var cc = new qx.ui.container.Composite();
      var ll = new qx.ui.layout.Canvas();
      cc.setLayout(ll);
      this.getRoot().add(cc);

      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      cc.add(c);

      var w = new qx.ui.core.Widget();
      c.add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      cc.hide();
      this.flush();

      this.assertFalse(w.isSeeable());

      ll.dispose();
      cc.destroy();
      l.dispose();
      w.destroy();
      c.destroy();
    },


    testIsSeeableDepth0 : function() {
      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);

      this.assertTrue(w.isSeeable());
      w.hide();
      this.assertFalse(w.isSeeable());

      w.destroy();
    },


    testIsSeeableDepth1 : function()
    {
      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      this.getRoot().add(c);
      var w = new qx.ui.core.Widget();
      c.add(w);

      this.assertTrue(w.isSeeable());
      c.hide();
      this.assertFalse(w.isSeeable());

      l.dispose();
      w.destroy();
      c.destroy();
    },


    testIsSeeableDepth2 : function()
    {
      var cc = new qx.ui.container.Composite();
      var ll = new qx.ui.layout.Canvas();
      cc.setLayout(ll);
      this.getRoot().add(cc);

      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      cc.add(c);

      var w = new qx.ui.core.Widget();
      c.add(w);

      this.assertTrue(w.isSeeable());
      cc.hide();
      this.assertFalse(w.isSeeable());

      ll.dispose();
      cc.destroy();
      l.dispose();
      w.destroy();
      c.destroy();
    },

    testIsSeeableDepth0AfterFlushExclude : function()
    {
      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      w.exclude();
      this.flush();

      this.assertFalse(w.isSeeable());

      w.destroy();
    },


    testIsSeeableNotInRoot : function()
    {
      var w = new qx.ui.core.Widget();
      this.assertFalse(w.isSeeable());
      w.destroy();
    },


    testGetShadowElement : function()
    {
      var w = new qx.ui.core.Widget();
      this.assertNull(w.getShadowElement());

      w.setShadow("shadow-window");
      this.assertInstance(w.getShadowElement(), qx.html.Decorator);
      this.assertEquals("shadow-window", w.getShadowElement().getId());

      w.destroy();
    },

    testLazyScrollChildIntoViewY : function()
    {
      var scroll = new qx.ui.container.Scroll().set({
        width: 100,
        height: 100
      });
      this.getRoot().add(scroll);

      var outer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      scroll.add(outer);

      var inner1 = new qx.ui.core.Widget().set({
        height: 150,
        backgroundColor: "red"
      });
      outer.add(inner1);

      var inner2 = new qx.ui.core.Widget().set({
        height: 20,
        backgroundColor: "green"
      });
      outer.add(inner2);

      var scrollTop = null;

      var listener1 = scroll.addListener("disappear", function(ev) {
        var child = this.getChildren()[0].getChildren()[1];
        this.scrollChildIntoView(child);
        this.setVisibility("visible");
      });

      var self = this;
      var listener2 = scroll.addListener("appear", function(ev) {
        var scrollPane = this._getChildren()[0];
        scrollTop = scrollPane.getContentElement().getDomElement().scrollTop;
      });

      qx.event.Timer.once(function() {
        scroll.setVisibility("hidden");
      }, this, 250);

      this.wait(1000, function() {
        this.assert(scrollTop > 0, "Child was not scrolled!");
        scroll.removeListenerById(listener1);
        scroll.removeListenerById(listener2);
        scroll.destroy();
      }, this);
    }
  }
});
