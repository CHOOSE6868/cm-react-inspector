import type { Fiber } from 'react-reconciler';
export interface CodeInfo {
    lineNumber: string;
    columnNumber: string;
    /**
     * code source file relative path to dev-server cwd(current working directory)
     * need use with `react-dev-inspector/plugins/babel`
     */
    relativePath?: string;
    /**
     * code source file absolute path
     * just need use with `@babel/plugin-transform-react-jsx-source` which auto set by most framework
     */
    absolutePath?: string;
}
/**
 * props that injected into react nodes
 *
 * like <div data-inspector-line="2" data-inspector-column="3" data-inspector-relative-path="xxx/ooo" />
 * this props will be record in fiber
 */
export interface CodeDataAttribute {
    'data-inspector-line': string;
    'data-inspector-column': string;
    'data-inspector-relative-path': string;
}
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
export declare const getCodeInfoFromDebugSource: (fiber?: any) => CodeInfo | undefined;
/**
 * code location data-attribute props inject by `react-dev-inspector/plugins/babel`
 */
export declare const getCodeInfoFromProps: (fiber?: any) => CodeInfo | undefined;
export declare const getCodeInfoFromFiber: (fiber?: any) => CodeInfo | undefined;
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
export declare const getReferenceFiber: (baseFiber?: any) => Fiber | undefined;
export declare const getElementCodeInfo: (element: HTMLElement) => CodeInfo | undefined;
export declare const gotoEditor: (source?: CodeInfo) => void;
export declare const getNamedFiber: (baseFiber?: any) => Fiber | undefined;
export declare const getElementInspect: (element: HTMLElement) => {
    fiber?: any;
    name?: string;
    title: string;
};
