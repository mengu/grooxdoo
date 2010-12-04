/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Abstract base class for the HBox and VBox decorators.
 * This decorator uses three images, which are positioned in a
 * vertical/horizontal line. The first and last image always keep their
 * original size. The center image is stretched.
 */

qx.Class.define("qx.ui.decoration.AbstractBox",
{
  extend: qx.ui.decoration.Abstract,
  implement : [qx.ui.decoration.IDecorator],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param baseImage {String} Base image to use
   * @param insets {Integer|Array} Insets for the grid
   * @param orientation {String} Vertical or horizontal orientation
   */
  construct : function(baseImage, insets, orientation)
  {
    this.base(arguments);
    this._setOrientation(orientation);

    if (qx.ui.decoration.css3.BorderImage.IS_SUPPORTED)
    {
      this.__impl = new qx.ui.decoration.css3.BorderImage();
      if (baseImage) {
        this.__setBorderImage(baseImage, orientation);
      }

      // Initialize properties
      if (insets != null) {
        this.__impl.setInsets(insets);
      }
    }
    else
    {
      this.__impl = new qx.ui.decoration.BoxDiv(baseImage, insets, orientation);
    }
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Base image URL. All the different images needed are named by the default
     * naming scheme:
     *
     * ${baseImageWithoutExtension}-${imageName}.${baseImageExtension}
     *
     * These image names are used:
     *
     * * t: top side (vertical orientation)
     * * b: bottom side (vertical orientation)
     *
     * * l: left side (horizontal orientation)
     * * r: right side (horizontal orientation)
     *
     * * c: center image
     */
    baseImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyBaseImage"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __impl : null,
    _isHorizontal : null,


    /**
     * Helper to set the orientation.
     *
     * @param orientation {String} horizontal or vertical
     */
    _setOrientation : function(orientation) {
      this._isHorizontal = orientation == "horizontal";
    },


    // interface implementation
    getMarkup : function() {
      return this.__impl.getMarkup();
    },


    // interface implementation
    resize : function(element, width, height) {
      this.__impl.resize(element, width, height);
    },


    // interface implementation
    tint : function(element, bgcolor) {
      // do nothing
    },


    // interface implementation
    getInsets : function() {
      return this.__impl.getInsets();
    },


    // property apply
    _applyInsets : function(value, old, name)
    {
      var setter = "set" + qx.lang.String.firstUp(name);
      this.__impl[setter](value);
    },


    // property apply
    _applyBaseImage : function(value, old)
    {
      if (this.__impl instanceof qx.ui.decoration.BoxDiv) {
        this.__impl.setBaseImage(value);
      } else {
        this.__setBorderImage(value);
      }
    },


    /**
     * Configures the border image decorator
     *
     * @param baseImage {String} URL of the base image
     */
    __setBorderImage : function(baseImage)
    {

      this.__impl.setBorderImage(baseImage);

      var base = qx.util.AliasManager.getInstance().resolve(baseImage);
      var split = /(.*)(\.[a-z]+)$/.exec(base);
      var prefix = split[1];
      var ext = split[2];

      var ResourceManager = qx.util.ResourceManager.getInstance();

      if (this._isHorizontal)
      {
        var leftSlice = ResourceManager.getImageWidth(prefix + "-l" + ext);
        var rightSlice = ResourceManager.getImageWidth(prefix + "-r" + ext);
        this.__impl.setSlice([0, rightSlice, 0, leftSlice]);
    }
      else
      {
        var bottomSlice = ResourceManager.getImageHeight(prefix + "-b" + ext);
        var topSlice = ResourceManager.getImageHeight(prefix + "-t" + ext);
        this.__impl.setSlice([topSlice, 0, bottomSlice, 0]);
      }

    }

  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__markup = this.__images = this.__edges = null;
  }
});
