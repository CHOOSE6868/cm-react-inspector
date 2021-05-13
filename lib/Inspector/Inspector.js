"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inspector = exports.defaultHotKeys = void 0;
const react_1 = require("react");
const hotkeys_js_1 = require("hotkeys-js");
const hightlight_1 = require("./utils/hightlight");
const inspect_1 = require("./utils/inspect");
const Overlay_1 = require("./Overlay");
exports.defaultHotKeys = ['control', 'shift', 'command', 'c'];
exports.Inspector = (props) => {
    const { keys, onHoverElement, onClickElement, disableLaunchEditor, children, } = props;
    const hotkey = (keys !== null && keys !== void 0 ? keys : exports.defaultHotKeys).join('+');
    const [isInspect, setIsInspect] = react_1.useState(false);
    const overlayRef = react_1.useRef();
    const handleHoverElement = (element) => {
        var _a;
        const overlay = overlayRef.current;
        const codeInfo = inspect_1.getElementCodeInfo(element);
        const relativePath = codeInfo === null || codeInfo === void 0 ? void 0 : codeInfo.relativePath;
        const { fiber, name, title } = inspect_1.getElementInspect(element);
        (_a = overlay === null || overlay === void 0 ? void 0 : overlay.inspect) === null || _a === void 0 ? void 0 : _a.call(overlay, [element], title, relativePath);
        onHoverElement === null || onHoverElement === void 0 ? void 0 : onHoverElement({
            element,
            fiber,
            codeInfo,
            name,
        });
    };
    const handleClickElement = (element) => {
        var _a;
        const overlay = overlayRef.current;
        (_a = overlay === null || overlay === void 0 ? void 0 : overlay.remove) === null || _a === void 0 ? void 0 : _a.call(overlay);
        overlayRef.current = undefined;
        setIsInspect(false);
        const codeInfo = inspect_1.getElementCodeInfo(element);
        const { fiber, name } = inspect_1.getElementInspect(element);
        if (!disableLaunchEditor)
            inspect_1.gotoEditor(codeInfo);
        onClickElement === null || onClickElement === void 0 ? void 0 : onClickElement({
            element,
            fiber,
            codeInfo,
            name,
        });
    };
    const startInspect = () => {
        const overlay = new Overlay_1.default();
        const stopCallback = hightlight_1.setupHighlighter({
            onPointerOver: handleHoverElement,
            onClick: handleClickElement,
        });
        overlay.setRemoveCallback(stopCallback);
        overlayRef.current = overlay;
        setIsInspect(true);
    };
    const stopInspect = () => {
        var _a;
        (_a = overlayRef.current) === null || _a === void 0 ? void 0 : _a.remove();
        setIsInspect(false);
    };
    const handleInspectKey = () => (isInspect
        ? stopInspect()
        : startInspect());
    react_1.useEffect(() => {
        const handleHotKeys = (event, handler) => {
            if (handler.key === hotkey) {
                handleInspectKey();
            }
            else if (isInspect && handler.key === 'esc') {
                stopInspect();
            }
        };
        hotkeys_js_1.default(`${hotkey}, esc`, handleHotKeys);
        //@ts-ignore
        window.__REACT_DEV_INSPECTOR_TOGGLE__ = handleInspectKey;
        return () => {
            hotkeys_js_1.default.unbind(`${hotkey}, esc`, handleHotKeys);
            //@ts-ignore
            delete window.__REACT_DEV_INSPECTOR_TOGGLE__;
        };
    }, [hotkey, isInspect, handleInspectKey]);
    return children;
};
