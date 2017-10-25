---
title: "Pattern Shader"
tags: unity shader
category: shader
thumbnail: /assets/2017-10-19-pattern-shader/final.png
comments: true
---
In this post we will develop the [stripes shader]({% post_url 2017-10-03-stripes-shader-1 %}) further and add another mode that allows us to render checker patterns.

![Final Pattern](/assets/2017-10-19-pattern-shader/final.png)

## Full rotation

In the stripes shader we used a trick to rotate the stripes: We just blended between horizontal and vertical stripes. This is valid and works quite fast but I'd like to show you how to implement a full rotation about any angle. This also has the benefit of not affecting the thickness of the stripes when you change the direction.

How do you rotate a point in 2D? [Googling for "2D Rotation"](https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/2drota.htm) gives the answer on the first search result:

```
x' = x cos f - y sin f
y' = y cos f + x sin f
```

so let's use this knowledge and write a function for our shader that rotates a point in 2D:

``` c
float2 rotatePoint(float2 pt, float2 center, float angle) {
	float sinAngle = sin(angle);
	float cosAngle = cos(angle);
	pt -= center;
	float2 r;
	r.x = pt.x * cosAngle - pt.y * sinAngle;
	r.y = pt.x * sinAngle + pt.y * cosAngle;
	r += center;
	return r;
}
```

Change the fragment shader:

``` c
//float2 pos;
//pos.x = lerp(i.uv.x, i.uv.y, _Direction);
//pos.y = lerp(i.uv.y, 1 - i.uv.x, _Direction);

float2 pos = rotatePoint(i.uv.xy, float2(0.5, 0.5), _Direction * 2 * PI);
```

And now we can rotate our stripes about 360 degrees!

**Note:** *Since `sin`and `cos` are expensive operations you might still want to keep the old version which blends horizontal and vertical stripes if your shader needs to be fast.*

## Shifting the width of stripes

Until now all stripes have the same width. We will add a new parameter to shift the width and replace the hardcoded value of 0.5:

``` c
_WidthShift ("Width Shift", Range(0, 1)) = 0.5
```
``` c
float _WidthShift;
```

...and change the fragment shader:

``` c
fixed value = floor(frac(pos.x) + _WidthShift);
```

Now we can change the thickness of stripes:

![Final Pattern](/assets/2017-10-19-pattern-shader/width-shift.png)

## More Colors!

The next option we will add is to specify up to four colors. These are the parameters:

``` c
Properties {
	[IntRange] _NumColors ("Number of colors", Range(2, 4)) = 2
	_Color1 ("Color 1", Color) = (0,0,0,1)
	_Color2 ("Color 2", Color) = (1,1,1,1)
	_Color3 ("Color 3", Color) = (1,0,1,1)
	_Color4 ("Color 4", Color) = (0,0,1,1)
	_Tiling ("Tiling", Range(1, 500)) = 10
	_Direction ("Direction", Range(0, 1)) = 0
	_WarpScale ("Warp Scale", Range(0, 1)) = 0
	_WarpTiling ("Warp Tiling", Range(1, 10)) = 1
}
```
``` c
int _NumColors;
fixed4 _Color1;
fixed4 _Color2;
fixed4 _Color3;
fixed4 _Color4;
int _Tiling;
float _Direction;
float _WarpScale;
float _WarpTiling;
```

In the Unity inspector of the shader the color section will look like this:

![Final Pattern](/assets/2017-10-19-pattern-shader/colors-inspector.png){:width="325px"}

**Note:** *The inspector always shows all four colors even if you set "Number of Colors" to a value lower than 4. The only way to change this is to write a [custom shader GUI](https://docs.unity3d.com/Manual/SL-CustomShaderGUI.html). In this example we won't do this.*

In the fragment shader we change the last lines like this:

``` c
fixed value = floor((frac(pos.x) + _WidthShift) * _NumColors);
value = min(value, _NumColors - 1);
switch (value) {
	case 3: return _Color4;
	case 2: return _Color3;
	case 1: return _Color2;
	default: return _Color1;
}
```
