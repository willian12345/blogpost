Is your app online? Here's how to reliably know in just 10 lines of JS [Guide]

你的 app 是否是 online 状态？ 10 行代码就可以靠谱的判断是否联网成功

We usually expect our web apps to be online but that ignores reality.

People go on planes, enter tunnels, have bad internet, or just decide to go offline. Depending on your user's expectations, should your app stop working?

If not, you'll need a reliable way to detect if your app is offline in order to offer the proper experience.

Here's how in just 10 lines of JS.



我们通常期望我们的app 一直是有网可用的，但这不现实。

当人们在飞机上，进入隧道，网络太烂，或者自身关掉了网络。根据你用户的需要，你的 app 应该停用吗？

如果你想要你的app 能正常工作，你需要一种可靠的方式判断 app 是否断开了网络以便为你的用户提供更好的用户体验

下面用 10 行 JS 代码搞定


Browser Navigator
Before coding, let's look at the lay of the land.

Browsers come with the navigator.onLine property. This straight up returns true or false based on the browser state.


So are we done? Well, because of how it works, you can only trust false to mean offline. true could be more varied.


### 浏览器

在写代码之前让我们先了解一些浏览器的基本情况

浏览器有一个属性叫 `navigator.onLine` 它会根据浏览器状态直接返回 true 或 false.

```
function isOnline () {
    return window.navigator.onLine
}
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/onLine

所以，这就搞定了吗？， 由于它的工作方式，你只能相信它为 false 的状态，但不能信它为 true 的状态


So how to tell if you also have access to the internet?
Because of the way navigator works, we know when we're offline but online is a little murky.

Navigator returns true when the device is connected to a network but that doesn't mean you are also connected to the internet which are 2 very different things.

Your first instinct might be to make a request to some random site and seeing if you get a success or an error.

But what kind of request? And to which resource? 🤔



### 如何状态你联网的状态


由于 navigator 的工作方式，我们可以知道是否掉线了，但是否联网却不一定

当我们的设备连拉网络时 navigator 返回 true 但这并不意味着我们成功连接了互联网，这是两回事儿。

你首先本能的会想到发一个请求到随机的某个网站看看能否成功。

但是发一个什么样的请求呢？请求什么样的资源 🤔


Sending the perfect request ✨
Checking the network status might happen often so ideally our request response should be as small as possible. This will make it faster and it will consume less bandwidth.

To figure what kind of requests are available, we can look at the different HTTP methods and the HEAD method stands out as the best (TRACE might actually be better but isn't supported by fetch).

A HEAD request is almost exactly like a GET request except we get no response data, only the HEADers. This works out great since our goal is to check if the request was successful or not, we don't actually care about any data returned.


### 发送一个完美的请求 ✨

检测网络状态是个常用的功能，这个请求应该尽量的小，这样更快且更少的消耗带宽资源。

为了找到可用的请求， 我们可以看看不同的 HTTP 请求方法， 显然 HEAD 方法比较秀(TRACE 实际上可能更好，但 fetch 还不支持)

HEAD 请求跟一个 GET 请求非常像，但不会得到回复数据，只有 HEADers. 对于我们只希望检测网络是否可用来说足够了，我们并不需要关心具体返回了什么数据 。


Where should you send the request?
We have the perfect request but where should it go?

Your first instinct might be to send it to some service or site that is always active. Maybe google.com? But try that and you will be greeted by CORS errors.

This makes sense, Google (and every other site by default) won't accept requests from random sites.
The next option is to make your own server or cloud function that would accept requests exclusively from your application!

But that's far too much work for a simple network check and a good developer is a lazy developer.

So back to square one, CORS errors.

Their goal is prevent security issues on requests coming from a different origin. Then wouldn't it be possible send the request to your own origin?

The answer is yes! And you can automatically get your origin with window.location.origin.


### 应该向哪里发送请求

发什么样的请求我们有了，但应该发往哪里？

你首先本能的就会想到把它发送到某个在线服务器或网站。 比如 google.com? 但你尝试后肯定会碰到跨域请求的错误。

这并不意外， Google (所有其它网站) 默认都不允许接收任意网站发来的请求。

下一个选项是将你自己的服务器设置为允许你这个app的请求

但对一个简单检测网络联接来说就太过了，一个好的开发者应该是一个要多懒有多懒的人。

所以又回到了起点， CORS 跨域访问错误。

CORS 的目的是阻止非同域名下的不安全请求。 所以有没有可能发送这个请求到你自己的 域下呢？

答案是肯定的！ 并且你可以自动获取你自己的域 `window.location.origin`

```
async function isOnline () {
  if (!window.navigator.onLine) return false

  const response = await fetch(
    window.location.origin,
    { method: 'HEAD' },
  )

  return response.ok
}
```

Now you can ping your own site and wait for a response, but the problem is since we always send the same request to the same URL, your browser will waste no time caching the result making our function useless.

So the final trick is to send our request with a randomized query parameter!
This will have no impact on the result and will prevent your browser from caching the response since it goes to a different URL each time.

And thanks to the built-in URL class, we don't even need to manually manipulate strings.

Here is the final code along with some extra error handling.




现在你可以 ping 你自己的站并等待回复， 但问题是由于我们发送的是同一个 URL 请求, 你的浏览器会缓存这个请求导致我们的方法不起作用。

所以最后一个小技巧是为我们的请求加一个随机的参数！

这个对结果不会产生影响，并且由于每次请求都是不同的URL 这会阻止浏览器对我们的请求进行缓存。

还要感谢浏览器内建的  URL 类，我们不需要手动拼接字符串。

下面是最终的代码，且包含了一些错误处理

```
getRandomString () {
  return Math.random().toString(36).substring(2, 15)
}

async function isOnline () {
  if (!window.navigator.onLine) return false

  // avoid CORS errors with a request to your own origin
  const url = new URL(window.location.origin)

  // random value to prevent cached responses
  url.searchParams.set('rand', getRandomString())

  try {
    const response = await fetch(
      url.toString(),
      { method: 'HEAD' },
    )

    return response.ok
  } catch {
    return false
  }
}

```



This gives us a more reliable check on the network's status but it is missing some configuration options.

Notably we always check with the same URL. This could be fine but what if you would prefer to ping your own server or just something closer to reduce latency?

Additionally this runs only on call, it might be useful to be able to pass a callback, or have some kind of observer.

You do get event listeners when the network status changes...


The final result here is very simple and I leave it up to you to expand this to fit your needs!



这给了我们一个更可靠的检测网络状态的方法，但它缺少了一些可配置项。

特别是我们只能检测同一个 URL。 它很好，但如果你想要 ping 自己的服务器或需要理低的延迟呢？

另外，它只会在主动调用时运行一次， 给它添加一个回调可能会更有用，或者添一些加监听。

你可以添加 online 或 offline 网络状态的监听...


```
window.addEventListener('online', () => console.log('online'))
window.addEventListener('offline', () => console.log('offline'))
```


上面的代码很简单，你有更复杂的需求可以自己扩展





----
https://dev.to/maxmonteil/is-your-app-online-here-s-how-to-reliably-know-in-just-10-lines-of-js-guide-3in7

