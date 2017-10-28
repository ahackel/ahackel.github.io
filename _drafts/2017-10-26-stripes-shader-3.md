---
title: "Stripes Shader - Part 3"
tags: tech-art unity shader
category: tech-art
thumbnail: /assets/2017-10-26-stripes-shader-3/final.png
comments: true
---
In this third part of [stripes shader]({% post_url 2017-10-03-stripes-shader-1 %}) series we will add a [new mode to render checker pattern](#checker-mode) instead stripes with different blend operations.

The final result will look like this:

![Final Pattern](/assets/2017-10-26-stripes-shader-3/final.png)

## Checker Mode

Let's start with adding a new mode. We want to select the mode from a drop down menu. This can be done by adding an `Enum` attribute to the property:

``` c
[Enum(Stripes, 0, Checker, 1)] _Mode ("Mode", Float) = 0
```

It looks like this in the Unity inspector:

![Final Pattern](/assets/2017-10-26-stripes-shader-3/drop-down-menu.png){:width="326px"}

You can learn more about property attributes in the [Unity Docs](https://docs.unity3d.com/ScriptReference/MaterialPropertyDrawer.html).
