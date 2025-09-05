# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in your app's build.gradle file.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Uncomment this to preserve the line number information for
# debugging stack traces.
-keepattributes LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
-renamesourcefileattribute SourceFile

# Capacitor Core
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.annotation.PluginMethod public *;
}

# Web assets
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}

# Keep all Capacitor plugin methods
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.annotation.PluginMethod <methods>;
}

# Prevent obfuscation of WebView interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Remove logs in release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}