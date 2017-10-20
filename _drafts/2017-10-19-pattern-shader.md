---
title: "Pattern Shader"
tags: shader unity
category: shader
thumbnail: /assets/2017-10-19-pattern-shader/final.png
comments: true
---
In this post we will develop the [stripes shader]({% post_url 2017-10-03-stripes-shader %}) further and add another mode that allows us to render checker patterns.

![Final Pattern](/assets/2017-10-19-pattern-shader/final.png)

## More Colors!

The first option we will add is to specify up to four colors. These are the parameters:

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
