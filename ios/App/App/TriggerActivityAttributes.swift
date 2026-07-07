import Foundation
#if canImport(ActivityKit)
import ActivityKit

/// Shared between the app target (TriggerActivityPlugin) and the widget
/// extension (TriggerLiveActivity) — this file must be a member of BOTH
/// targets in Xcode.
@available(iOS 16.2, *)
struct TriggerActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// Wall-clock end of the countdown (valid while running).
        var endDate: Date
        var paused: Bool
        /// Remaining seconds, frozen at the moment of pausing.
        var pausedRemainingSec: Double
    }

    /// Trigger id, e.g. "pomodoro" — drives the accent colour in the widget.
    var triggerId: String
    /// Display name, e.g. "Pomodoro".
    var triggerName: String
    var durationSec: Double
}
#endif
