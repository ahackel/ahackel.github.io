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
	fixed4 color;
	float pos = i.uv.x * 10;				
	fixed value = fmod((int)pos, 2);
	color = value;
	return color;
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
	fixed4 color;
	float pos = lerp(i.uv.x, i.uv.y, _Direction) * _Tiling;
	fixed value = fmod((int)pos, 2);
	color = value;
	return color;
}
```

And now we have stripes at any direction!

![UVs shader](/assets/2017-10-03-stripes-shader/stripes2.png)

You will notice a little downside of this method: diagonal stripes will be a bit thicker than horizontal or vertical stripes. Of course there is a way to compensate this but for simplicity we keep it like this for now.

## colors

It's time to add some color! We declare two color parameters:

``` c
Properties {
	_Tiling ("Tiling", Range(1, 500)) = 10
	_Direction ("Direction", Range(0, 1)) = 0
}
```
