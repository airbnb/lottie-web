/**************************************************************************************************
*
* ADOBE SYSTEMS INCORPORATED
* Copyright 2013 Adobe Systems Incorporated
* All Rights Reserved.
*
* NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the
* terms of the Adobe license agreement accompanying it.  If you have received this file from a
* source other than Adobe, then your use, modification, or distribution of it requires the prior
* written permission of Adobe.
*
**************************************************************************************************/

/** CSInterface - v5.0.0 */

/**
 * Stores constants for the window types supported by the CSXS infrastructure.
 */
function CSXSWindowType()
{
};

/** Constant for the CSXS window type Panel. */
CSXSWindowType._PANEL = "Panel";

/** Constant for the CSXS window type Modeless. */
CSXSWindowType._MODELESS = "Modeless";

/** Constant for the CSXS window type ModalDialog. */
CSXSWindowType._MODAL_DIALOG = "ModalDialog";

/** EvalScript error message */
EvalScript_ErrMessage = "EvalScript error.";

/**
 * @class Version
 * Defines a version number with major, minor, micro, and special
 * components. The major, minor and micro values are numeric; the special
 * value can be any string.
 *
 * @param major   The major version component, a positive integer up to nine digits long.
 * @param minor   The minor version component, a positive integer up to nine digits long.
 * @param micro   The micro version component, a positive integer up to nine digits long.
 * @param special The special version component, an arbitrary string.
 *
 * @return A new \c Version object.
 */
function Version(major, minor, micro, special)
{
    this.major = major;
    this.minor = minor;
    this.micro = micro;
    this.special = special;
};

/**
 * The maximum value allowed for a numeric version component.
 * This reflects the maximum value allowed in PlugPlug and the manifest schema.
 */
Version.MAX_NUM = 999999999;

/**
 * @class VersionBound
 * Defines a boundary for a version range, which associates a \c Version object
 * with a flag for whether it is an inclusive or exclusive boundary.
 *
 * @param version   The \c #Version object.
 * @param inclusive True if this boundary is inclusive, false if it is exclusive.
 *
 * @return A new \c VersionBound object.
 */
function VersionBound(version, inclusive)
{
    this.version = version;
    this.inclusive = inclusive;
};

/**
 * @class VersionRange
 * Defines a range of versions using a lower boundary and optional upper boundary.
 *
 * @param lowerBound The \c #VersionBound object.
 * @param upperBound The \c #VersionBound object, or null for a range with no upper boundary.
 *
 * @return A new \c VersionRange object.
 */
function VersionRange(lowerBound, upperBound)
{
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
};

/**
 * @class Runtime
 * Represents a runtime related to the CEP infrastructure.
 * Extensions can declare dependencies on particular
 * CEP runtime versions in the extension manifest.
 *
 * @param name    The runtime name.
 * @param version A \c #VersionRange object that defines a range of valid versions.
 *
 * @return A new \c Runtime object.
 */
function Runtime(name, versionRange)
{
    this.name = name;
    this.versionRange = versionRange;
};

/**
* @class Extension
* Encapsulates a CEP-based extension to an Adobe application.
*
* @param id              The unique identifier of this extension.
* @param name            The localizable display name of this extension.
* @param mainPath        The path of the "index.html" file.
* @param basePath        The base path of this extension.
* @param windowType          The window type of the main window of this extension.
                 Valid values are defined by \c #CSXSWindowType.
* @param width           The default width in pixels of the main window of this extension.
* @param height          The default height in pixels of the main window of this extension.
* @param minWidth        The minimum width in pixels of the main window of this extension.
* @param minHeight       The minimum height in pixels of the main window of this extension.
* @param maxWidth        The maximum width in pixels of the main window of this extension.
* @param maxHeight       The maximum height in pixels of the main window of this extension.
* @param defaultExtensionDataXml The extension data contained in the default \c ExtensionDispatchInfo section of the extension manifest.
* @param specialExtensionDataXml The extension data contained in the application-specific \c ExtensionDispatchInfo section of the extension manifest.
* @param requiredRuntimeList     An array of \c Runtime objects for runtimes required by this extension.
* @param isAutoVisible       True if this extension is visible on loading.
* @param isPluginExtension   True if this extension has been deployed in the Plugins folder of the host application.
*
* @return A new \c Extension object.
*/
function Extension(id, name, mainPath, basePath, windowType, width, height, minWidth, minHeight, maxWidth, maxHeight,
                   defaultExtensionDataXml, specialExtensionDataXml, requiredRuntimeList, isAutoVisible, isPluginExtension)
{
    this.id = id;
    this.name = name;
    this.mainPath = mainPath;
    this.basePath = basePath;
    this.windowType = windowType;
    this.width = width;
    this.height = height;
    this.minWidth = minWidth;
    this.minHeight = minHeight;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.defaultExtensionDataXml = defaultExtensionDataXml;
    this.specialExtensionDataXml = specialExtensionDataXml;
    this.requiredRuntimeList = requiredRuntimeList;
    this.isAutoVisible = isAutoVisible;
    this.isPluginExtension = isPluginExtension;
};

/**
 * @class CSEvent
 * A standard JavaScript event, the base class for CEP events.
 *
 * @param type        The name of the event type.
 * @param scope       The scope of event, can be "GLOBAL" or "APPLICATION".
 * @param appId       The unique identifier of the application that generated the event.
 * @param extensionId     The unique identifier of the extension that generated the event.
 *
 * @return A new \c CSEvent object
 */
function CSEvent(type, scope, appId, extensionId)
{
    this.type = type;
    this.scope = scope;
    this.appId = appId;
    this.extensionId = extensionId;
};

/** Event-specific data. */
CSEvent.prototype.data = "";

/**
 * @class SystemPath
 * Stores operating-system-specific location constants for use in the
 * \c #CSInterface.getSystemPath() method.
 * @return A new \c SystemPath object.
 */
function SystemPath()
{
};

/** The path to user data.  */
SystemPath.USER_DATA = "userData";

/** The path to common files for Adobe applications.  */
SystemPath.COMMON_FILES = "commonFiles";

/** The path to the user's default document folder.  */
SystemPath.MY_DOCUMENTS = "myDocuments";

/** @deprecated. Use \c #SystemPath.Extension.  */
SystemPath.APPLICATION = "application";

/** The path to current extension.  */
SystemPath.EXTENSION = "extension";

/** The path to hosting application's executable.  */
SystemPath.HOST_APPLICATION = "hostApplication";

/**
 * @class ColorType
 * Stores color-type constants.
 */
function ColorType()
{
};

/** RGB color type. */
ColorType.RGB = "rgb";

/** Gradient color type. */
ColorType.GRADIENT = "gradient";

/** Null color type. */
ColorType.NONE = "none";

/**
 * @class RGBColor
 * Stores an RGB color with red, green, blue, and alpha values.
 * All values are in the range [0.0 to 255.0]. Invalid numeric values are
 * converted to numbers within this range.
 *
 * @param red   The red value, in the range [0.0 to 255.0].
 * @param green The green value, in the range [0.0 to 255.0].
 * @param blue  The blue value, in the range [0.0 to 255.0].
 * @param alpha The alpha (transparency) value, in the range [0.0 to 255.0].
 *      The default, 255.0, means that the color is fully opaque.
 *
 * @return A new RGBColor object.
 */
function RGBColor(red, green, blue, alpha)
{
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
};

/**
 * @class Direction
 * A point value  in which the y component is 0 and the x component
 * is positive or negative for a right or left direction,
 * or the x component is 0 and the y component is positive or negative for
 * an up or down direction.
 *
 * @param x     The horizontal component of the point.
 * @param y     The vertical component of the point.
 *
 * @return A new \c Direction object.
 */
function Direction(x, y)
{
    this.x = x;
    this.y = y;
};

/**
 * @class GradientStop
 * Stores gradient stop information.
 *
 * @param offset   The offset of the gradient stop, in the range [0.0 to 1.0].
 * @param rgbColor The color of the gradient at this point, an \c #RGBColor object.
 *
 * @return GradientStop object.
 */
function GradientStop(offset, rgbColor)
{
    this.offset = offset;
    this.rgbColor = rgbColor;
};

/**
 * @class GradientColor
 * Stores gradient color information.
 *
 * @param type          The gradient type, must be "linear".
 * @param direction     A \c #Direction object for the direction of the gradient
                (up, down, right, or left).
 * @param numStops          The number of stops in the gradient.
 * @param gradientStopList  An array of \c #GradientStop objects.
 *
 * @return A new \c GradientColor object.
 */
function GradientColor(type, direction, numStops, arrGradientStop)
{
    this.type = type;
    this.direction = direction;
    this.numStops = numStops;
    this.arrGradientStop = arrGradientStop;
};

/**
 * @class UIColor
 * Stores color information, including the type, anti-alias level, and specific color
 * values in a color object of an appropriate type.
 *
 * @param type          The color type, 1 for "rgb" and 2 for "gradient".
                The supplied color object must correspond to this type.
 * @param antialiasLevel    The anti-alias level constant.
 * @param color         A \c #RGBColor or \c #GradientColor object containing specific color information.
 *
 * @return A new \c UIColor object.
 */
function UIColor(type, antialiasLevel, color)
{
    this.type = type;
    this.antialiasLevel = antialiasLevel;
    this.color = color;
};

/**
 * @class AppSkinInfo
 * Stores window-skin properties, such as color and font. All color parameter values are \c #UIColor objects except that systemHighlightColor is \c #RGBColor object.
 *
 * @param baseFontFamily        The base font family of the application.
 * @param baseFontSize          The base font size of the application.
 * @param appBarBackgroundColor     The application bar background color.
 * @param panelBackgroundColor      The background color of the extension panel.
 * @param appBarBackgroundColorSRGB     The application bar background color, as sRGB.
 * @param panelBackgroundColorSRGB      The background color of the extension panel, as sRGB.
 * @param systemHighlightColor          The operating-system highlight color, as sRGB.
 *
 * @return AppSkinInfo object.
 */
function AppSkinInfo(baseFontFamily, baseFontSize, appBarBackgroundColor, panelBackgroundColor, appBarBackgroundColorSRGB, panelBackgroundColorSRGB, systemHighlightColor)
{
    this.baseFontFamily = baseFontFamily;
    this.baseFontSize = baseFontSize;
    this.appBarBackgroundColor = appBarBackgroundColor;
    this.panelBackgroundColor = panelBackgroundColor;
    this.appBarBackgroundColorSRGB = appBarBackgroundColorSRGB;
    this.panelBackgroundColorSRGB = panelBackgroundColorSRGB;
    this.systemHighlightColor = systemHighlightColor;
};

/**
 * @class HostEnvironment
 * Stores information about the environment in which the extension is loaded.
 *
 * @param appName   The application's name.
 * @param appVersion    The application's version.
 * @param appLocale The application's current license locale.
 * @param appUILocale   The application's current UI locale.
 * @param appId     The application's unique identifier.
 * @param isAppOnline  True if the application is currently online.
 * @param appSkinInfo   An \c #AppSkinInfo object containing the application's default color and font styles.
 *
 * @return A new \c HostEnvironment object.
 */
function HostEnvironment(appName, appVersion, appLocale, appUILocale, appId, isAppOnline, appSkinInfo)
{
    this.appName = appName;
    this.appVersion = appVersion;
    this.appLocale = appLocale;
    this.appUILocale = appUILocale;
    this.appId = appId;
    this.isAppOnline = isAppOnline;
    this.appSkinInfo = appSkinInfo;
};

/**
 * @class HostCapabilities
 * Stores information about the host capabilities.
 *
 * @param EXTENDED_PANEL_MENU True if the application supports panel menu.
 * @param EXTENDED_PANEL_ICONS True if the application supports panel icon.
 * @param DELEGATE_APE_ENGINE True if the application supports delegated APE engine.
 * @param SUPPORT_HTML_EXTENSIONS True if the application supports HTML extensions.
 * @param DISABLE_FLASH_EXTENSIONS True if the application disables FLASH extensions.
 *
 * @return A new \c HostCapabilities object.
 */
function HostCapabilities(EXTENDED_PANEL_MENU, EXTENDED_PANEL_ICONS, DELEGATE_APE_ENGINE, SUPPORT_HTML_EXTENSIONS, DISABLE_FLASH_EXTENSIONS)
{
    this.EXTENDED_PANEL_MENU = EXTENDED_PANEL_MENU;
    this.EXTENDED_PANEL_ICONS = EXTENDED_PANEL_ICONS;
    this.DELEGATE_APE_ENGINE = DELEGATE_APE_ENGINE;
    this.SUPPORT_HTML_EXTENSIONS = SUPPORT_HTML_EXTENSIONS;
	this.DISABLE_FLASH_EXTENSIONS = DISABLE_FLASH_EXTENSIONS; // Since 5.0.0
};

/**
 * @class ApiVersion
 * Stores current api version.
 *
 * Since 4.2.0
 *
 * @param major  The major version
 * @param minor  The minor version.
 * @param micro  The micro version.
 *
 * @return ApiVersion object.
 */
function ApiVersion(major, minor, micro)
{
    this.major = major;
    this.minor = minor;
    this.micro = micro;
};

//------------------------------ CSInterface ----------------------------------

/**
 * @class CSInterface
 * This is the entry point to the CEP extensibility infrastructure.
 * Instantiate this object and use it to:
 * <ul>
 * <li>Access information about the host application in which an extension is running</li>
 * <li>Launch an extension</li>
 * <li>Register interest in event notifications, and dispatch events</li>
 * </ul>
 *
 * @return A new \c CSInterface object
 */
function CSInterface()
{
};

/**
 * User can add this event listener to handle native application theme color changes.
 * Callback function gives extensions ability to fine-tune their theme color after the
 * global theme color has been changed.
 * The callback function should be like below:
 *
 * @example
 * // event is a CSEvent object, but user can ignore it.
 * function OnAppThemeColorChanged(event)
 * {
 *    // Should get a latest HostEnvironment object from application.
 *    var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
 *    // Gets the style information such as color info from the skinInfo,
 *    // and redraw all UI controls of your extension according to the style info.
 * }
 */
CSInterface.THEME_COLOR_CHANGED_EVENT = "com.adobe.csxs.events.ThemeColorChanged";

/** The host environment data object. */
CSInterface.prototype.hostEnvironment = JSON.parse(window.__adobe_cep__.getHostEnvironment());

/** Retrieves information about the host environment in which the
 *  extension is currently running.
 *
 *   @return A \c #HostEnvironment object.
 */
CSInterface.prototype.getHostEnvironment = function()
{
    this.hostEnvironment = JSON.parse(window.__adobe_cep__.getHostEnvironment());
    return this.hostEnvironment;
};

/** Closes this extension. */
CSInterface.prototype.closeExtension = function()
{
    window.__adobe_cep__.closeExtension();
};

/**
 * Retrieves a path for which a constant is defined in the system.
 *
 * @param pathType The path-type constant defined in \c #SystemPath ,
 *
 * @return The platform-specific system path string.
 */
CSInterface.prototype.getSystemPath = function(pathType)
{
    var path = decodeURI(window.__adobe_cep__.getSystemPath(pathType));
    var OSVersion = this.getOSInformation();
    if (OSVersion.indexOf("Windows") >= 0)
    {
      path = path.replace("file:///", "");
    }
    else if (OSVersion.indexOf("Mac") >= 0)
    {
      path = path.replace("file://", "");
    }
    return path;
};

/**
 * Evaluates a JavaScript script, which can use the JavaScript DOM
 * of the host application.
 *
 * @param script    The JavaScript script.
 * @param callback  Optional. A callback function that receives the result of execution.
 *          If execution fails, the callback function receives the error message \c EvalScript_ErrMessage.
 */
CSInterface.prototype.evalScript = function(script, callback)
{
    if(callback == null || callback == undefined)
    {
        callback = function(result){};
    }
    window.__adobe_cep__.evalScript(script, callback);
};

/**
 * Retrieves the unique identifier of the application.
 * in which the extension is currently running.
 *
 * @return The unique ID string.
 */
CSInterface.prototype.getApplicationID = function()
{
    var appId = this.hostEnvironment.appId;
    return appId;
};

/**
 * Retrieves host capability information for the application
 * in which the extension is currently running.
 *
 * @return A \c #HostCapabilities object.
 */
CSInterface.prototype.getHostCapabilities = function()
{
    var hostCapabilities = JSON.parse(window.__adobe_cep__.getHostCapabilities() );
    return hostCapabilities;
};

/**
 * Triggers a CEP event programmatically. Yoy can use it to dispatch
 * an event of a predefined type, or of a type you have defined.
 *
 * @param event A \c CSEvent object.
 */
CSInterface.prototype.dispatchEvent = function(event)
{
    if (typeof event.data == "object")
    {
        event.data = JSON.stringify(event.data);
    }

    window.__adobe_cep__.dispatchEvent(event);
};

/**
 * Registers an interest in a CEP event of a particular type, and
 * assigns an event handler.
 * The event infrastructure notifies your extension when events of this type occur,
 * passing the event object to the registered handler function.
 *
 * @param type     The name of the event type of interest.
 * @param listener The JavaScript handler function or method.
 * @param obj      Optional, the object containing the handler method, if any.
 *         Default is null.
 */
CSInterface.prototype.addEventListener = function(type, listener, obj)
{
    window.__adobe_cep__.addEventListener(type, listener, obj);
};

/**
 * Removes a registered event listener.
 *
 * @param type      The name of the event type of interest.
 * @param listener  The JavaScript handler function or method that was registered.
 * @param obj       Optional, the object containing the handler method, if any.
 *          Default is null.
 */
CSInterface.prototype.removeEventListener = function(type, listener, obj)
{
    window.__adobe_cep__.removeEventListener(type, listener, obj);
};

/**
 * Loads and launches another extension, or activates the extension if it is already loaded.
 *
 * @param extensionId       The extension's unique identifier.
 * @param startupParams     Not currently used, pass "".
 *
 * @example
 * To launch the extension "help" with ID "HLP" from this extension, call:
 * <code>requestOpenExtension("HLP", ""); </code>
 *
 */
CSInterface.prototype.requestOpenExtension = function(extensionId, params)
{
    window.__adobe_cep__.requestOpenExtension(extensionId, params);
};

/**
 * Retrieves the list of extensions currently loaded in the current host application.
 * The extension list is initialized once, and remains the same during the lifetime
 * of the CEP session.
 *
 * @param extensionIds  Optional, an array of unique identifiers for extensions of interest.
 *          If omitted, retrieves data for all extensions.
 *
 * @return Zero or more \c #Extension objects.
 */
CSInterface.prototype.getExtensions = function(extensionIds)
{
    var extensionIdsStr = JSON.stringify(extensionIds);
    var extensionsStr = window.__adobe_cep__.getExtensions(extensionIdsStr);

    var extensions = JSON.parse(extensionsStr);
    return extensions;
};

/**
 * Retrieves network-related preferences.
 *
 * @return A JavaScript object containing network preferences.
 */
CSInterface.prototype.getNetworkPreferences = function()
{
    var result = window.__adobe_cep__.getNetworkPreferences();
    var networkPre = JSON.parse(result);

    return networkPre;
};

/**
 * Initializes the resource bundle for this extension with property values
 * for the current application and locale.
 * To support multiple locales, you must define a property file for each locale,
 * containing keyed display-string values for that locale.
 * See localization documentation for Extension Builder and related products.
 *
 * Keys can be in the
 * form <code>key.value="localized string"</code>, for use in HTML text elements.
 * For example, in this input element, the localized \c key.value string is displayed
 * instead of the empty \c value string:
 *
 * <code><input type="submit" value="" data-locale="key"/></code>
 *
 * @return An object containing the resource bundle information.
 */
CSInterface.prototype.initResourceBundle = function()
{
    var resourceBundle = JSON.parse(window.__adobe_cep__.initResourceBundle());
    var resElms = document.querySelectorAll('[data-locale]');
    for (var n = 0; n < resElms.length; n++)
    {
       var resEl = resElms[n];
       // Get the resource key from the element.
       var resKey = resEl.getAttribute('data-locale');
       if (resKey)
       {
           // Get all the resources that start with the key.
           for (var key in resourceBundle)
           {
               if (key.indexOf(resKey) == 0)
               {
                   var resValue = resourceBundle[key];
                   if (key.indexOf('.') == -1)
                   {
                       // No dot notation in resource key,
                       // assign the resource value to the element's
                       // innerHTML.
                       resEl.innerHTML = resValue;
                   }
                   else
                   {
                       // Dot notation in resource key, assign the
                       // resource value to the element's property
                       // whose name corresponds to the substring
                       // after the dot.
                       var attrKey = key.substring(key.indexOf('.') + 1);
                       resEl[attrKey] = resValue;
                   }
               }
           }
       }
    }
    return resourceBundle;
};

/**
 * Writes installation information to a file.
 *
 * @return The file path.
 */
CSInterface.prototype.dumpInstallationInfo = function()
{
    return window.__adobe_cep__.dumpInstallationInfo();
};

/**
 * Retrieves version information for the current Operating System,
 * See http://www.useragentstring.com/pages/Chrome/ for Chrome \c navigator.userAgent values.
 *
 * @return A string containing the OS version, or "unknown Operation System".
 */
CSInterface.prototype.getOSInformation = function()
{
    var userAgent = navigator.userAgent;

    if ((navigator.platform == "Win32") || (navigator.platform == "Windows"))
    {
        var winVersion = "Windows platform";
        if (userAgent.indexOf("Windows NT 5.0") > -1)
        {
            winVersion = "Windows 2000";
        }
        else if (userAgent.indexOf("Windows NT 5.1") > -1)
        {
            winVersion = "Windows XP";
        }
        else if (userAgent.indexOf("Windows NT 5.2") > -1)
        {
            winVersion = "Windows Server 2003";
        }
        else if (userAgent.indexOf("Windows NT 6.0") > -1)
        {
            winVersion = "Windows Vista";
        }
        else if (userAgent.indexOf("Windows NT 6.1") > -1)
        {
            winVersion = "Windows 7";
        }
        else if (userAgent.indexOf("Windows NT 6.2") > -1)
        {
            winVersion = "Windows 8";
        }

        var winBit = "32-bit";
        if (userAgent.indexOf("WOW64") > -1)
        {
            winBit = "64-bit";
        }

        return winVersion + " " + winBit;
    }
    else if ((navigator.platform == "MacIntel") || (navigator.platform == "Macintosh"))
    {
        var agentStr = new String();
        agentStr = userAgent;
        var verLength = agentStr.indexOf(")") - agentStr.indexOf("Mac OS X");
        var verStr = agentStr.substr(agentStr.indexOf("Mac OS X"), verLength);
        var result = verStr.replace("_", ".");
        result = result.replace("_", ".");
        return result;
    }

    return "Unknown Operation System";
};

/**
 * Opens a page in the default system browser.
 *
 * Since 4.2.0
 *
 * @param url   The URL of the page to open. Must use HTTP or HTTPS protocol.
 *
 * @return One of these error codes:\n
 *      <ul>\n
 *          <li>NO_ERROR - 0</li>\n
 *          <li>ERR_UNKNOWN - 1</li>\n
 *          <li>ERR_INVALID_PARAMS - 2</li>\n
 *          <li>ERR_INVALID_URL - 201</li>\n
 *      </ul>\n
 */
CSInterface.prototype.openURLInDefaultBrowser = function(url)
{
    return cep.util.openURLInDefaultBrowser(url);
};

/**
 * Retrieves extension ID.
 *
 * Since 4.2.0
 *
 * @return extension ID.
 */
CSInterface.prototype.getExtensionID = function()
{
     return window.__adobe_cep__.getExtensionId();
};

/**
 * Retrieves scale factor of screen. This only works on Mac.
 *
 * Since 4.2.0
 *
 * @return One of the following integer.
 *      <ul>\n
 *          <li>-1 means fail to get scale factor or this API has not been available on Windows yet</li>\n
 *          <li>1 means normal screen</li>\n
 *          <li>2 means HiDPI screen</li>\n
 *      </ul>\n
 */
CSInterface.prototype.getScaleFactor = function()
{
    return window.__adobe_cep__.getScaleFactor();
};

/**
 * Set a handler to detect any changes of scale factor. This only works on Mac.
 *
 * Since 4.2.0
 *
 * @param handler   The function to be called when scale factor is changed.
 *
 */
CSInterface.prototype.setScaleFactorChangedHandler = function(handler)
{
    window.__adobe_cep__.setScaleFactorChangedHandler(handler);
};

/**
 * Retrieves current API version.
 *
 * Since 4.2.0
 *
 * @return ApiVersion object.
 *
 */
CSInterface.prototype.getCurrentApiVersion = function()
{
    var apiVersion = JSON.parse(window.__adobe_cep__.getCurrentApiVersion());
    return apiVersion;
};