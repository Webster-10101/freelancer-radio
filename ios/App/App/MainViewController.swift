import UIKit
import Capacitor

/// Custom bridge view controller so plugins that live in the app binary
/// (rather than an SPM/npm package) can be registered with Capacitor.
/// Referenced from Main.storyboard.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(RoutePickerPlugin())
    }
}
