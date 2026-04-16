package com.aditipatil21.frontend

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import android.util.Log

class NotificationListenerService : NotificationListenerService() {

  override fun onNotificationPosted(sbn: StatusBarNotification) {
    try {
      val extras = sbn.notification.extras
      val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
      val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
      val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""
      val packageName = sbn.packageName

      val payload: WritableMap = Arguments.createMap().apply {
        putString("packageName", packageName)
        putString("title", title)
        putString("text", text)
        putString("bigText", bigText)
      }

      sendEvent("notificationReceived", payload)
    } catch (e: Exception) {
      Log.e("NotificationService", "Failed to process notification", e)
    }
  }

  private fun sendEvent(eventName: String, params: WritableMap) {
    val reactContext = (application as MainApplication)
      .reactNativeHost
      .reactInstanceManager
      .currentReactContext

    reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      ?.emit(eventName, params)
  }
}