---
title: "Stripes Shader - Part 3"
tags: tech-art unity shader
category: tech-art
thumbnail: /assets/2017-10-26-stripes-shader-3/final.png
comments: true
---
In this third part of [stripes shader]({% post_url 2017-10-03-stripes-shader-1 %}) series we will add a [new mode to render checker pattern](#checker-mode) instead stripes. We will also implement different [blend operations](#blend-operations).

The final result will look like this:

![Final Pattern](/assets/2017-10-26-stripes-shader-3/final.png)

## Checker Mode

Let's start with adding a new mode in the properties. We want to select the mode from a drop down menu. This can be done by adding an `Enum` attribute to the property:

``` c
[Enum(Stripes, 0, Checker, 1)] _Mode ("Mode", Float) = 0
```

It looks like this in the Unity inspector:

![Final Pattern](/assets/2017-10-26-stripes-shader-3/drop-down-menu.png){:width="326px"}

You can learn more about property attributes in the [Unity Docs](https://docs.unity3d.com/ScriptReference/MaterialPropertyDrawer.html).

## Extending the Fragment Shader

Next we implement the checker mode into the fragment shader. The basic idea is to **calculate `pos` and  `value` in two axis**. We already do this for `pos` because we need it for the warp effect. So we only need to calculate `value` in both axis, too. Then we **combine the two components of `value`** and use the resulting value to pick a color.

``` c
fixed4 frag (v2f i) : SV_Target
{
	const float PI = 3.14159;

	float2 pos = rotatePoint(i.uv.xy, float2(0.5, 0.5), _Direction * 2 * PI);

	pos.x += sin(pos.y * _WarpTiling * PI * 2) * _WarpScale;
	pos *= _Tiling;

	int2 value = floor(frac(pos) * _NumColors + _WidthShift);
	value = clamp(value, 0, _NumColors - 1);
	if (_Mode == 1) {
		value.x += value.y;
		value.x = fmod(value, _NumColors);
	}

	switch (value.x) {
		case 3: return _Color4;
		case 2: return _Color3;
		case 1: return _Color2;
		default: return _Color1;
	}
}
```

Now step by step. First we apply tiling to both components of pos:

```c
pos *= _Tiling;
```

Then we change the type of `value` to `int2` and calculate the value from both components of `pos`:

```c
int2 value = floor(frac(pos) * _NumColors + _WidthShift);
```

The following line did not change but since value is now an `int2` both components are being clamped. So far the result would be the same if we just render stripes. No comes the interesting part which actually does something different if `_Mode` equals 1 which is the checker mode. If we are in checker mode the two components of value are being combined. Because the result can be greater than `_NumColors + 1` we perform a modulo afterwards:

``` c
if (_Mode == 1) {
	value.x += value.y;
	value.x = fmod(value, _NumColors);
}
```

In the switch we need `value.x` because value is now an `int2`:

``` c
switch (value.x) {
```

## Checker in Action

Let's see how the new checked mode looks with two colors:

![Final Pattern](/assets/2017-10-26-stripes-shader-3/checker-2.png)

Nothing fancy. But we can tweak the parameters to get more interesting results. This is a checker pattern with 4 colors:

![Final Pattern](/assets/2017-10-26-stripes-shader-3/checker-1.png)

The same pattern with rotation, warp and width shift parameters modified:

![Final Pattern](/assets/2017-10-26-stripes-shader-3/checker-3.png)

## Blend Operations
