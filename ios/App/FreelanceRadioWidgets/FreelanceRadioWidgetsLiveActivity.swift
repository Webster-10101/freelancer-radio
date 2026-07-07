import ActivityKit
import WidgetKit
import SwiftUI

// Accent colours mirror the web app's trigger palettes.
private func accent(for triggerId: String) -> Color {
    switch triggerId {
    case "pomodoro":  return Color(red: 0.13, green: 0.83, blue: 0.93)   // cyan #22d3ee
    case "power-nap": return Color(red: 0.65, green: 0.55, blue: 0.98)   // lilac #a78bfa
    case "breathe":   return Color(red: 0.18, green: 0.83, blue: 0.75)   // teal #2dd4bf
    case "sprint":    return Color(red: 0.96, green: 0.62, blue: 0.04)   // amber #f59e0b
    default:          return Color(red: 0.13, green: 0.83, blue: 0.93)
    }
}

/// Countdown text: live-updating while running, frozen mm:ss while paused.
private struct CountdownText: View {
    let state: TriggerActivityAttributes.ContentState
    let attributes: TriggerActivityAttributes

    var body: some View {
        if state.paused {
            Text(formatted(state.pausedRemainingSec))
        } else {
            Text(timerInterval: timerRange, countsDown: true)
        }
    }

    private var timerRange: ClosedRange<Date> {
        let start = state.endDate.addingTimeInterval(-attributes.durationSec)
        return min(start, Date()) ... max(state.endDate, Date())
    }

    private func formatted(_ seconds: Double) -> String {
        let total = max(0, Int(seconds.rounded()))
        return String(format: "%d:%02d", total / 60, total % 60)
    }
}

private struct LockScreenView: View {
    let context: ActivityViewContext<TriggerActivityAttributes>

    var body: some View {
        let color = accent(for: context.attributes.triggerId)
        VStack(spacing: 10) {
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "dot.radiowaves.left.and.right")
                        .foregroundStyle(color)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(context.attributes.triggerName)
                            .font(.headline)
                            .foregroundStyle(.white)
                        Text(context.state.paused ? "Paused" : "Freelance Radio")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.6))
                    }
                }
                Spacer()
                CountdownText(state: context.state, attributes: context.attributes)
                    .font(.title.weight(.semibold))
                    .monospacedDigit()
                    .foregroundStyle(color)
            }
            if !context.state.paused {
                ProgressView(
                    timerInterval: context.state.endDate.addingTimeInterval(-context.attributes.durationSec) ... context.state.endDate,
                    countsDown: false,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .progressViewStyle(.linear)
                .tint(color)
            }
        }
        .padding(16)
    }
}

struct TriggerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TriggerActivityAttributes.self) { context in
            LockScreenView(context: context)
                .activityBackgroundTint(Color(red: 0.04, green: 0.04, blue: 0.06))
                .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            let color = accent(for: context.attributes.triggerId)
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 6) {
                        Image(systemName: "dot.radiowaves.left.and.right")
                            .foregroundStyle(color)
                        Text(context.attributes.triggerName)
                            .font(.headline)
                            .foregroundStyle(.white)
                    }
                    .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    CountdownText(state: context.state, attributes: context.attributes)
                        .font(.title2.weight(.semibold))
                        .monospacedDigit()
                        .foregroundStyle(color)
                        .frame(maxWidth: 64, alignment: .trailing)
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    if context.state.paused {
                        Text("Paused")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.6))
                    } else {
                        ProgressView(
                            timerInterval: context.state.endDate.addingTimeInterval(-context.attributes.durationSec) ... context.state.endDate,
                            countsDown: false,
                            label: { EmptyView() },
                            currentValueLabel: { EmptyView() }
                        )
                        .progressViewStyle(.linear)
                        .tint(color)
                        .padding(.horizontal, 4)
                    }
                }
            } compactLeading: {
                Image(systemName: "dot.radiowaves.left.and.right")
                    .foregroundStyle(color)
            } compactTrailing: {
                CountdownText(state: context.state, attributes: context.attributes)
                    .font(.caption2.weight(.semibold))
                    .monospacedDigit()
                    .foregroundStyle(color)
                    .frame(maxWidth: 44)
            } minimal: {
                Image(systemName: "timer")
                    .foregroundStyle(color)
            }
        }
    }
}
