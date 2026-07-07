import Foundation
import Capacitor
#if canImport(ActivityKit)
import ActivityKit
#endif

/// Bridges trigger timers to ActivityKit Live Activities (Dynamic Island +
/// lock screen countdown). Registered in MainViewController.capacitorDidLoad().
/// Requires iOS 16.2 — earlier versions resolve as no-ops so the JS side
/// never needs to care.
@objc(TriggerActivityPlugin)
public class TriggerActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TriggerActivityPlugin"
    public let jsName = "TriggerActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setPaused", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise)
    ]

    @objc func start(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else {
            call.resolve()
            return
        }
        guard let triggerId = call.getString("triggerId"),
              let triggerName = call.getString("triggerName"),
              let durationSec = call.getDouble("durationSec"),
              let endEpochMs = call.getDouble("endEpochMs") else {
            call.reject("Missing options")
            return
        }

        Task {
            // A crash or force-quit can strand a previous activity; clear
            // anything stale before starting a fresh one.
            await Self.endAllActivities()

            guard ActivityAuthorizationInfo().areActivitiesEnabled else {
                call.resolve()
                return
            }

            let attributes = TriggerActivityAttributes(
                triggerId: triggerId,
                triggerName: triggerName,
                durationSec: durationSec
            )
            let state = TriggerActivityAttributes.ContentState(
                endDate: Date(timeIntervalSince1970: endEpochMs / 1000),
                paused: false,
                pausedRemainingSec: 0
            )
            // Failure here (e.g. user disabled Live Activities) is non-fatal:
            // the in-app timer is the source of truth, the activity is a mirror.
            _ = try? Activity.request(
                attributes: attributes,
                content: .init(state: state, staleDate: nil)
            )
            call.resolve()
        }
    }

    @objc func setPaused(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else {
            call.resolve()
            return
        }
        let paused = call.getBool("paused") ?? false
        let remainingMs = call.getDouble("remainingMs") ?? 0

        Task {
            for activity in Activity<TriggerActivityAttributes>.activities {
                let state = TriggerActivityAttributes.ContentState(
                    endDate: Date().addingTimeInterval(remainingMs / 1000),
                    paused: paused,
                    pausedRemainingSec: remainingMs / 1000
                )
                await activity.update(.init(state: state, staleDate: nil))
            }
            call.resolve()
        }
    }

    @objc func end(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else {
            call.resolve()
            return
        }
        Task {
            await Self.endAllActivities()
            call.resolve()
        }
    }

    @available(iOS 16.2, *)
    private static func endAllActivities() async {
        for activity in Activity<TriggerActivityAttributes>.activities {
            await activity.end(nil, dismissalPolicy: .immediate)
        }
    }
}
