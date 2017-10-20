---
title: "Stripes shader"
tags: shader unity
category: shader
thumbnail: /assets/2017-10-03-stripes-shader/final.png
comments: true
---
This is the first post of my Unity shaders series. The series is aimed at people who have a little bit experience with writing shaders in Unity but I will try to explain everything so beginners can follow, too. Also I want to show you all the little tricks I learned and I will keep everything clean and simple.

## Why should you write shaders?

I'm a technical artists in the games industry. Part of my job is to make the surface of real time 3D objects of our games look as good as possible. Shaders play in important role here. They are a powerful tool to create beautiful materials. So I can really encourage everyone who wants to create materials for games to learn to write shaders! And materials are just the beginning. Shaders can also be used for post effects, rendering and tools.

## Stripes shader

Today I will show you how to create a simple stripes shader in Unity. The final shader will look like this:

![Final Stripes](/assets/2017-10-03-stripes-shader/final.png)

Quite hypnotic, isn't it? An example of how such a shader can be used is the hills of the wonderful game [Tiny Wings](http://www.andreasilliger.com/) by Andreas Illiger.

## Getting started

I don't start at zero here. So if you are new at shaders have a look at [writing shaders](https://docs.unity3d.com/Manual/ShadersOverview.html) in the Unity docs. This gives you a very nice starting point.

We will start with a new unlit shader in Unity. Right click in the project window and select **Create > Shader > Unlit Shader**. In the new file we strip away everything we don't need until we have the most simple unlit shader:

``` c
Shader "Unlit/NewUnlitShader"
{
	SubShader
	{
		Tags { "RenderType"="Opaque" }

		Pass
		{
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag

			struct appdata
			{
				float4 vertex : POSITION;
				float2 uv : TEXCOORD0;
			};

			struct v2f
			{
				float2 uv : TEXCOORD0;
				float4 vertex : SV_POSITION;
			};

			v2f vert (appdata v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.uv = v.uv;
				return o;
			}

			fixed4 frag (v2f i) : SV_Target
			{
				return 0;
			}
			ENDCG
		}
	}
}
```

## UVs shader

Now we will change the simple unlit shader so it renders the texture coordinates aka uvs as colors. We need to modify the fragment shader like this:

``` c
fixed4 frag (v2f i) : SV_Target
{
	fixed4 color;
	color.rg = i.uv;
	return color;
}
```

Now you get this:

![UVs shader](/assets/2017-10-03-stripes-shader/uvs.png)

## Zebra Crossing

The next step is to calculate stripes from the uvs. We will start with vertical stripes:

![UVs shader](/assets/2017-10-03-stripes-shader/stripes1.png)

We need to change the fragment shader:

``` c
fixed4 frag (v2f i) : SV_Target
{
	float pos = i.uv.x * 10;
	fixed value = fmod((int)pos, 2);
	return value;
}
```

Let's see what's going on here. First we take the x value of the uvs which reaches from 0 to 1. We multiply it by the number of stripes we want to have and store it in a variable `pos`. In the next line we convert the value of `pos` into an int. This transforms the gradient we have seen in the uvs shader into steps from 0 to 9. Then we perform a modulo operation on the steps which gives us the alternating pattern.

## Tiling parameter

Now let's make the tiling a parameter so it can be tweaked. First add a property block to the shader:

``` c
Properties {
	_Tiling ("Tiling", Range(1, 500)) = 10
}
```

Define the `_Tiling` variable in the code

``` c
int _Tiling;
```

and replace the hard coded tiling value in the fragment shader:

``` c
float pos = i.uv.x * _Tiling;
```

## Direction

Next we want to control the direction of our stripes by another parameter. We will use a little trick here to avoid complex rotation transformation. The idea is to blend between vertical and horizontal stripes. How do we get horizontal stripes? Just use the y value of the uvs instead of x in the fragment shader:

``` c
float pos = i.uv.y * _Tiling;
```

To specify an arbitrary direction we first declare a new parameter `_Direction`

``` c
Properties {
	_Tiling ("Tiling", Range(1, 500)) = 10
	_Direction ("Direction", Range(0, 1)) = 0
}
```

and blend between x and y:

``` c
fixed4 frag (v2f i) : SV_Target
{
	float pos = lerp(i.uv.x, i.uv.y, _Direction) * _Tiling;
	fixed value = fmod((int)pos, 2);
	return value;
}
```

And now we have stripes at any direction!

![UVs shader](/assets/2017-10-03-stripes-shader/stripes2.png)

**Note:** *You will notice a little downside of this method: diagonal stripes will be a bit thicker than horizontal or vertical stripes. Of course there is a way to compensate this but for simplicity's sake we keep it like this for now.*

## Colors

It's time to add some color! First we declare two color parameters and the corresponding variables:

``` c
Properties {
	_Color1 ("Color 1", Color) = (0,0,0,1)
	_Color2 ("Color 2", Color) = (1,1,1,1)
	_Tiling ("Tiling", Range(1, 500)) = 10
	_Direction ("Direction", Range(0, 1)) = 0
}
```
``` c
fixed4 _Color1;
fixed4 _Color2;
int _Tiling;
float _Direction;
```

and in the fragment shader we blend between the two colors based on `value`:

``` c
fixed4 frag (v2f i) : SV_Target
{
	float pos = lerp(i.uv.x, i.uv.y, _Direction) * _Tiling;
	fixed value = fmod((int)pos, 2);
	return lerp(_Color1, _Color2, value);
}
```

Now we have colored stripes:

![UVs shader](/assets/2017-10-03-stripes-shader/stripes3.png)

## Warping

Now we add some warping to the stripes. For this we need to more parameters:

``` c
Properties {
	_Color1 ("Color 1", Color) = (0,0,0,1)
	_Color2 ("Color 2", Color) = (1,1,1,1)
	_Tiling ("Tiling", Range(1, 500)) = 10
	_Direction ("Direction", Range(0, 1)) = 0
	_WarpScale ("Warp Scale", Range(0, 1)) = 0
	_WarpTiling ("Warp Tiling", Range(1, 10)) = 1
}
```
``` c
fixed4 _Color1;
fixed4 _Color2;
int _Tiling;
float _Direction;
float _WarpScale;
float _WarpTiling;
```

and then we modify the fragment shader as follows:

``` c
fixed4 frag (v2f i) : SV_Target
{
	const float PI = 3.14159;

	float pos1 = lerp(i.uv.x, i.uv.y, _Direction);
	float pos2 = lerp(i.uv.y, 1 - i.uv.x, _Direction);

	pos1 += sin(pos2 * _WarpTiling * PI * 2) * _WarpScale;
	pos1 += _WarpScale;
	pos1 *= _Tiling;

	fixed value = fmod((int)pos1, 2);
	return lerp(_Color1, _Color2, value);
}
```

Now step by step. First we define a constant `PI` that we will use later to tranform uvs into radians as arguments for `sin`:
``` c
const float PI = 3.14159;
```

We rename our pos variable to pos1 because we need another position which should always be orthogonal to pos1. For example if `_Direction` is zero `pos1` would be `i.uv.x` which is a gradient along the x-axis and we would get vertical stripes. And `pos2` would be `i.uv.y` which is gradient along the y-axis - orthogonal to the first one. We need this second gradient because we want to warp along the axis orthogonal to to the stripes.

``` c
float pos1 = lerp(i.uv.x, i.uv.y, _Direction);
float pos2 = lerp(i.uv.y, 1 - i.uv.x, _Direction);
```

![UVs shader](/assets/2017-10-03-stripes-shader/pos.png)

The next line adds an offset to `pos1` which does the warping. It's just a sine function which takes `pos2` as an argument. Because `sin` wants its arguments in radian units we multiply `pos2` by 2 PI so there is exactly one sine wave along the pos2-axis. To allow tiling of the sine wave we multiply also by `_WarpTiling`. We multiply result of the sine function by `_WarpScale` so we can scale the amount of warping along the pos1-axis.

``` c
pos1 += sin(pos2 * _WarpTiling * PI * 2) * _WarpScale;
```

The following line adds another offset. We need this so pos1 never becomes negative. Negative values would add some artifacts to warped stripes at the origin of the pos1-axis.

``` c
pos1 += _WarpScale;
```

In the last line we multiply `pos1` by the tiling parameter.

``` c
pos1 *= _Tiling;
```

This is the full code of the stripes shader and the final result:

``` c
Shader "Unlit/Stripes"
{
    Properties {
		_Color1 ("Color 1", Color) = (0,0,0,1)
		_Color2 ("Color 2", Color) = (1,1,1,1)
		_Tiling ("Tiling", Range(1, 500)) = 10
		_Direction ("Direction", Range(0, 1)) = 0
		_WarpScale ("Warp Scale", Range(0, 1)) = 0
		_WarpTiling ("Warp Tiling", Range(1, 10)) = 1
	}

	SubShader
	{

		Pass
		{
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag

			#include "UnityCG.cginc"

			fixed4 _Color1;
			fixed4 _Color2;
			int _Tiling;
			float _Direction;
			float _WarpScale;
			float _WarpTiling;

			struct appdata
			{
				float4 vertex : POSITION;
				float2 uv : TEXCOORD0;
			};

			struct v2f
			{
				float2 uv : TEXCOORD0;
				float4 vertex : SV_POSITION;
			};

			v2f vert (appdata v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.uv = v.uv;
				return o;
			}

			fixed4 frag (v2f i) : SV_Target
			{
				const float PI = 3.14159;

				float pos1 = lerp(i.uv.x, i.uv.y, _Direction);
				float pos2 = lerp(i.uv.y, 1 - i.uv.x, _Direction);

				pos1 += _WarpScale;
				pos1 += sin(pos2 * _WarpTiling * PI * 2) * _WarpScale;
				pos1 *= _Tiling;

				fixed value = fmod((int)pos1, 2);
				return lerp(_Color1, _Color2, value);
			}
			ENDCG
		}
	}
}
```

![Final Stripes](/assets/2017-10-03-stripes-shader/final.png)

Here you can find a [Unity Package of the shader and an example scene]().

And that's all folks! I hope you learned something new and have fun playing around with the shader!
