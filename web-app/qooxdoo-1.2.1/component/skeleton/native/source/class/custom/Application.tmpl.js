/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(${NamespacePath}/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "${Name}"
 */
qx.Class.define("${Namespace}.Application",
{
  extend : qx.application.Native,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */
      
      var logger = qx.bom.Element.create("div");
      var loggerStyles = {
        "width" : "80%",
        "height" : "250px",
        "border" : "1px solid lightgrey",
        "overflow" : "auto"
      };      
      qx.bom.element.Style.setStyles(logger, loggerStyles);
      document.body.appendChild(logger);      
      
      // indicate startup
      logger.innerHTML += "Application ready ...<br/>"; 

      qx.bom.Element.addListener(document.body, "keydown", function(e) {
        logger.innerHTML += e.getKeyIdentifier() + "<br>";
      });
            
    }
  }
});
