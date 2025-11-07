Button


https://github.com/mallfoundry/taroify.git

包：/packages/core/src/button



入口： /packages/core/src/button/index.ts


它由 Button.Group 和 Button 两个组件构成


使用举例：

```
<Button.Group variant="contained" color="primary" shape="round">
  <Button> <ArrowLeft /> 上一步</Button>
  <Button> <Replay /> 刷新</Button>
  <Button>下一步 <Arrow /></Button>
</Button.Group>

```

index.ts 仅是用于导出组件及相关组件


最主要的还是 button.tsx 文件，是组件的主要功能文件

一上来就发现一个我没使用过的包 `classNames`

```
import classNames from "classnames"
```

`classNames` 用于动态、条件化地管理 HTML 元素的 class 类名。它能简化复杂场景下的 className 字符串拼接逻辑，使代码更清晰、易维护。

然而我写的少，并没使用过这个库，了解以后，非常有用，比如：

```
// 使用 classNames
import classNames from 'classnames';
<div className={classNames('static', { active: isActive, 'error': hasError })} /> 
// 结果：isActive 和 hasError 为 true 时添加对应类名，否则忽略

// 不使用 classNames（原生写法对比）
<div className={`static ${isActive ? 'active' : ''} ${hasError ? 'error' : ''}`} />
```


button.tsx 主要包含以下几个方法内部方法

```
// 组件的 loading 状态
useButtonLoading

// 组件的前后 icon 显示
appendButtonIconClassname

// 组件的子元素
useButtonChildren

// 组件的 props 属性管理
useButtonPropertyValue


```

button.tsx 导出供外部使用的方法

此  **Button** 为主函数


```
export default function Button(props: ButtonProps) {
	const {
    	className,
    	// ...略
  	} = props

  	const {
    	variant: variantCtx,
    	// ...略
  	} = useContext(ButtonGroupContext)


 	const { onClick: onCtxClick } = useContext(ButtonContext)
 	const variant = useButtonPropertyValue(variantProp, variantCtx, "contained")
 	const shape = useButtonPropertyValue(shapeProp, shapeCtx)
 	const size = useButtonPropertyValue(sizeProp, sizeCtx, "medium")
  const color = useButtonPropertyValue(colorProp, colorCtx, "default")
  const hairline = useButtonPropertyValue(hairlineProp, hairlineCtx)
  const disabled = useButtonPropertyValue(disabledProp, disabledCtx)

  const loading = useButtonLoading(loadingProp)

  const children = useButtonChildren({ children: childrenProp, loading, icon, iconPosition })


  //...略
}
```

首先处理的一定是 click 事件, button 么，就是用来点击的。通过 useContext 实现传递

```
const { onClick: onCtxClick } = useContext(ButtonContext)
```

props 或 Button.Group 传入的 props, 通过 `useButtonPropertyValue` 方法判断最终应该返回哪些实际 Button 用到的属性

以 variant 这个属性举例

useButtonPropertyValue 方法很简单，

```
function useButtonPropertyValue<T>(value1?: T, value2?: T, defaultValue?: T) {
  return useMemo(() => {
    if (value1) {
      return value1
    }
    if (value2) {
      return value2
    }
    return defaultValue
  }, [defaultValue, value1, value2])
}
```


```
const variant = useButtonPropertyValue(variantProp, variantCtx, "contained")
```

优先使用的 button 上写的 props，如果没写，则用 Button.Group 上写的 variant，两个都没有最后默认的值是 "contained"


`useButtonLoading`  则用于生成 Loading 元素

它有可能是 boolean 值，也可能是一个 `LoadingProps` 即 Loading 组件对象

```
function useButtonLoading(loading?: boolean | LoadingProps | ReactElement): ReactNode {
  return useMemo(() => {
    if (_.isBoolean(loading) && loading) {
      return (
        <Loading
          // ...
        />
      )
    }

    if (isObjectElement(loading as ReactNode)) {
      const { className, ...restProps } = loading as LoadingProps
      return (
        <Loading
          // ...
          {...restProps}
        />
      )
    }

    if (isElementOf(loading as ReactNode, Loading)) {
      return cloneElement(loading as ReactElement, {
        // ...
      })
    }

    // ...
  }, [loading])
}
```

它简化后，就三个判断： 1，返回默认loading, 2，传递loading 属性值，3，直接返回 传递进来的 Loading 组件


接下来是 `useButtonChildren`


由于是在小程序中， button 最终用的是微信小程序的 Button 组件

要定制化样式，就需要将 “真” Button 组件给隐藏起来。


```
export default function Button(props: ButtonProps) {
  //...
  return (
    <View
      className={classNames(
        prefixClassname("button"),
        //...
      )}
      style={style}
      //...
    >
      {children}
      <ButtonBase
      	//...
      />
    </View>
  )
}

```

Button 按钮组件组成的基本结构渲染后会解析成网页 dom 显示：

```html
<taro-view-core class="taroify-button">
	<taro-view-core class="taroify-button__content">
		...
	</taro-view-core>
	<taro-button-core class="taroify-button-base taroify-button__button"></taro-button-core>
</taro-view-core
```

注意这个 `<taro-button-core class="taroify-button-base taroify-button__button"></taro-button-core>`

即是用于渲染小程序原生组件，利用 css 样式将它透明的盖在 button__content 上

以下是 button-base 对应的 样式，绝对定位加透明隐形

```scss
.#{$component-prefix}button-base {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%; 
  padding: 0;
  background: transparent;
  border: 0 none;
  outline: none;
  opacity: 0;

  &::after {
    display: none;
  }
}
```

所以真正看到的是 useButtonChildren 返回的 children 元素，即可定制化的子元素


useButtonChildren 比较简单，就是渲染通过接收判断 props 传递进来的 react 子元素

包含 loading、icon、文本、 reactNode 等


```
function useButtonChildren(options: UseButtonChildrenOptions) {
  const { loading, icon: iconProp, children, iconPosition } = options
  //...

  return (
    <ButtonContent>
      {loading}
      {iconPosition === "left" && icon}
      {
        //
        _.map(childrenArray, (child, index) => {
          if (isIconElement(child) && index === 0) {
            return appendButtonIconClassname(child, prefixClassname("button__icon--right"))
          }
          if (isIconElement(child) && index === lastIndex) {
            return appendButtonIconClassname(child, prefixClassname("button__icon--left"))
          }
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <View key={index} className={prefixClassname("button__text")}>
              {child}
            </View>
          )
        })
      }
      {iconPosition === "right" && icon}
    </ButtonContent>
  )
}
```


源码最后一个导出方法是

```
export function createButton(children: ReactNode | ButtonProps, props?: ButtonProps) {
  if (_.isPlainObject(children)) {
    return <Button {...(children as ButtonProps)} {...props} />
  }
  return <Button children={children as ReactNode} {...props} />
}
```

非常简单，就是导出 createButton 动态创建 react 元素

比如在 Dialog 组件内动态判断渲染 footer 内的 确认，取消之类的按钮

```
actions.push(createButton(confirm, /**...**/))
```


























