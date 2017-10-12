---
title: "Stripes shader"
tags: shader unity
category: shader
---
This is the first post of my Unity shaders series. The series is aimed at people who have a little bit experience with writing shaders in Unity but I will try to explain everything so beginners can follow, too.

Also I want to all the little tricks I learned. I will keep everything clean and simple.

About me? Why do I write shaders?

Today I will show you how to create a simple stripes shader in Unity.

final example.
[Image]

How to create a simple unlit shader. Right click in Unity
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

uvs shader
[Image]
``` ShaderLab
Code
```

Using uvs, modulo, tiling parameter
[Image]
``` ShaderLab
Code
```

Simple rotation. Add direction parameter. Just interpolate between horizontal and vertical uvs to avoid complex rotation transformation. Link to rotation transformation
[Image]
``` ShaderLab
Code
```
