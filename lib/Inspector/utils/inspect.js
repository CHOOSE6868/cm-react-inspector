"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementInspect = exports.getNamedFiber = exports.gotoEditor = exports.getElementCodeInfo = exports.getReferenceFiber = exports.getCodeInfoFromFiber = exports.getCodeInfoFromProps = exports.getCodeInfoFromDebugSource = void 0;
const launchEditorEndpoint_1 = require("react-dev-utils/launchEditorEndpoint");
const fiber_1 = require("./fiber");
/**
 * react fiber property `_debugSource` created by `@babel/plugin-transform-react-jsx-source`
 *     https://github.com/babel/babel/blob/main/packages/babel-plugin-transform-react-jsx-source/src/index.js#L51
 *
 * and injected `__source` property used by `React.createElement`, then pass to `ReactElement`
 *     https://github.com/facebook/react/blob/master/packages/react/src/ReactElement.js#L350-L374
 *     https://github.com/facebook/react/blob/master/packages/react/src/ReactElement.js#L189
 *
 * finally, used by `createFiberFromElement` to become a fiber property `_debugSource`.
 *     https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiber.new.js#L634
 */
exports.getCodeInfoFromDebugSource = (fiber) => {
    if (!(fiber === null || fiber === void 0 ? void 0 : fiber._debugSource))
        return undefined;
    const { fileName, lineNumber, columnNumber, } = fiber._debugSource;
    if (fileName && lineNumber) {
        return {
            lineNumber: String(lineNumber),
            columnNumber: String(columnNumber !== null && columnNumber !== void 0 ? columnNumber : 1),
            /**
             * fileName in debugSource is absolutely
             */
            absolutePath: fileName,
        };
    }
    return undefined;
};
/**
 * code location data-attribute props inject by `react-dev-inspector/plugins/babel`
 */
exports.getCodeInfoFromProps = (fiber) => {
    if (!(fiber === null || fiber === void 0 ? void 0 : fiber.pendingProps))
        return undefined;
    const { 'data-inspector-line': lineNumber, 'data-inspector-column': columnNumber, 'data-inspector-relative-path': relativePath, } = fiber.pendingProps;
    if (lineNumber && columnNumber && relativePath) {
        return {
            lineNumber,
            columnNumber,
            relativePath,
        };
    }
    return undefined;
};
exports.getCodeInfoFromFiber = (fiber) => {
    var _a;
    return ((_a = exports.getCodeInfoFromProps(fiber)) !== null && _a !== void 0 ? _a : exports.getCodeInfoFromDebugSource(fiber));
};
/**
 * try to get react component reference fiber from the dom fiber
 *
 * fiber examples see below:
 * *******************************************************
 *
 *  div                                       div
 *    └─ h1                                     └─ h1  (<--base) <--reference
 *      └─ span  (<--base) <--reference           └─ span
 *
 * *******************************************************
 *
 *  Title  <--reference                       Title
 *    └─ h1  (<--base)                          └─ h1  (<--base) <--reference
 *      └─ span                                 └─ span
 *                                              └─ div
 *
 * *******************************************************
 *
 *  Title  <- reference                       Title  <- reference
 *    └─ TitleName [ForwardRef]                 └─ TitleName [ForwardRef]
 *      └─ Context.Customer                       └─ Context.Customer
 *         └─ Context.Customer                      └─ Context.Customer
 *          └─ h1  (<- base)                          └─ h1  (<- base)
 *            └─ span                             └─ span
 *                                                └─ div
 *
 * *******************************************************
 *
 *  Title
 *    └─ TitleName [ForwardRef]
 *      └─ Context.Customer
 *         └─ Context.Customer
 *          └─ h1  (<- base) <- reference
 *    └─ span
 *    └─ div
 */
exports.getReferenceFiber = (baseFiber) => {
    if (!baseFiber)
        return undefined;
    const directParent = fiber_1.getDirectParentFiber(baseFiber);
    if (!directParent)
        return undefined;
    const isParentNative = fiber_1.isNativeTagFiber(directParent);
    const isOnlyOneChild = !directParent.child.sibling;
    let referenceFiber = (!isParentNative && isOnlyOneChild)
        ? directParent
        : baseFiber;
    // fallback for cannot find code-info fiber when traverse to root
    const originReferenceFiber = referenceFiber;
    while (referenceFiber) {
        if (exports.getCodeInfoFromFiber(referenceFiber))
            return referenceFiber;
        referenceFiber = referenceFiber.return;
    }
    return originReferenceFiber;
};
exports.getElementCodeInfo = (element) => {
    const fiber = fiber_1.getElementFiberUpward(element);
    const referenceFiber = exports.getReferenceFiber(fiber);
    return exports.getCodeInfoFromFiber(referenceFiber);
};
exports.gotoEditor = (source) => {
    if (!source)
        return;
    const { lineNumber, columnNumber, relativePath, absolutePath, } = source;
    const isRelative = Boolean(relativePath);
    const launchParams = {
        fileName: isRelative ? relativePath : absolutePath,
        lineNumber,
        colNumber: columnNumber,
    };
    /**
     * api in 'react-dev-inspector/plugins/webpack/launchEditorMiddleware'
     */
    const apiRoute = isRelative
        ? `${launchEditorEndpoint_1.default}/relative`
        : launchEditorEndpoint_1.default;
    //fetch(`${apiRoute}?${queryString.stringify(launchParams)}`)
    fetch(`/vscode/goto?file=${launchParams.fileName}&line=${launchParams.lineNumber}&column=${launchParams.colNumber}`);
};
exports.getNamedFiber = (baseFiber) => {
    var _a, _b;
    let fiber = baseFiber;
    // fallback for cannot find code-info fiber when traverse to root
    let originNamedFiber;
    while (fiber) {
        let parent = (_a = fiber.return) !== null && _a !== void 0 ? _a : undefined;
        let forwardParent;
        while (fiber_1.isReactSymbolFiber(parent)) {
            if (fiber_1.isForwardRef(parent)) {
                forwardParent = parent;
            }
            parent = (_b = parent === null || parent === void 0 ? void 0 : parent.return) !== null && _b !== void 0 ? _b : undefined;
        }
        if (forwardParent) {
            fiber = forwardParent;
        }
        if (fiber_1.getFiberName(fiber)) {
            if (!originNamedFiber)
                originNamedFiber = fiber;
            if (exports.getCodeInfoFromFiber(fiber))
                return fiber;
        }
        fiber = parent;
    }
    return originNamedFiber;
};
exports.getElementInspect = (element) => {
    const fiber = fiber_1.getElementFiberUpward(element);
    const referenceFiber = exports.getReferenceFiber(fiber);
    const namedFiber = exports.getNamedFiber(referenceFiber);
    const fiberName = fiber_1.getFiberName(namedFiber);
    const nodeName = element.nodeName.toLowerCase();
    const title = fiberName
        ? `${nodeName} in <${fiberName}>`
        : nodeName;
    return {
        fiber: referenceFiber,
        name: fiberName,
        title,
    };
};
