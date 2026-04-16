package com.aditipatil21.frontend

import android.content.Intent
import android.provider.Settings
import android.provider.Settings.Secure
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NotificationModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "NotificationListener"
  }

  @ReactMethod
  fun openNotificationListenerSettings(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("OPEN_SETTINGS_FAILED", error.message)
    }
  }

  @ReactMethod
  fun isNotificationServiceEnabled(promise: Promise) {
    try {
      val enabledListeners =
        Secure.getString(reactApplicationContext.contentResolver, "enabled_notification_listeners")
      val packageName = reactApplicationContext.packageName
      promise.resolve(enabledListeners?.contains(packageName) == true)
    } catch (error: Exception) {
      promise.resolve(false)
    }
  }
}

