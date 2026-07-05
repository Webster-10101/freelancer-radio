import Foundation
import Capacitor
import AVKit

/// Presents the system AirPlay route picker from JS (RoutePicker.show()).
/// AVRoutePickerView has no public "present" API, so we keep a hidden
/// instance in the view hierarchy and trigger its internal button.
@objc(RoutePickerPlugin)
public class RoutePickerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RoutePickerPlugin"
    public let jsName = "RoutePicker"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise)
    ]

    private var routePickerView: AVRoutePickerView?

    @objc func show(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let viewController = self.bridge?.viewController else {
                call.reject("No view controller available")
                return
            }

            if self.routePickerView == nil {
                let picker = AVRoutePickerView(frame: .zero)
                picker.isHidden = true
                viewController.view.addSubview(picker)
                self.routePickerView = picker
            }

            guard let button = self.routePickerView?.subviews.compactMap({ $0 as? UIButton }).first else {
                call.reject("Route picker button not found")
                return
            }

            button.sendActions(for: .touchUpInside)
            call.resolve()
        }
    }
}
