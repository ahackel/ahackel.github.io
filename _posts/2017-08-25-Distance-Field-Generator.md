---
title: "Distance Field Generator"
---
When I created the water shader for ZRoyale it annoyed me that waves were cut off at some areas where objects intersect the water plane. The reason for this is that the water shader uses the scene depth for calculating the distance if an object to the water plane. This is however only correct for surfaces facing the camera. For waves that are not cut off we need a map the gives us the distance of a point on the water from any intersecting object.

![](/assets/waves.png)

## What is a distance field?

(2D) distance fields are images in which each pixel represents the distance from that point to the nearest obstacle pixel. They can by signed to distinguish between pixel being within or without the shape. They look like a blurred image - so what can you do with it?

![](/assets/Sample.png){:width="250px"}
![](/assets/Sample2.png){:width="250px"}

## Application

Distance field maps have many applications in video games. For example they can be used for

### Collision detection

Since each pixel represents the closest distance to any obstacle you can use distance fields for collision detection.

### Rendering high quality fonts

Valve introduced a technique to render high quality fonts with the use of distance field maps:
[http://www.valvesoftware.com/publications/2007/SIGGRAPH2007_AlphaTestedMagnification.pdf](http://www.valvesoftware.com/publications/2007/SIGGRAPH2007_AlphaTestedMagnification.pdf)

There is also a Unity plugin that uses this technique to render text effects called TextMesh Pro:
[https://www.assetstore.unity3d.com/en/#!/content/84126](https://www.assetstore.unity3d.com/en/#!/content/84126)

### Effects

Distance field maps can also be used to render effects. Some examples can be found in the samples section.

# Creating a distance field renderer in Unity

This is the basic idea:

*   place a plane into the Unity editor
*   get the area of other objects intersecting the plane
*   calculate a distance field of the intersection shape

# Cross Section shader

To get the intersection area we will render the scene from the view of the plane into a render texture with a ***cross section shader***.

Some years ago a wrote a simple liquid shader for the Unreal Engine. It could be used to render liquids like wine into glasses. You could modify the fill level and rotate the glass and the surface of the liquid would always stay aligned with the horizon.

<ac:image ac:height="250"><ri:attachment ri:filename="RotatingLiquid.gif"></ri:attachment></ac:image>

How does it work?

<colgroup><col style="width: 33.0275%;"><col style="width: 66.9725%;"></colgroup>
|

<div class="content-wrapper">

<ac:image ac:height="250"><ri:attachment ri:filename="Liquid1.png"></ri:attachment></ac:image>

<span>1) Render the glass</span>

</div>

 |

<div class="content-wrapper"><ac:structured-macro ac:name="code" ac:schema-version="1" ac:macro-id="56a2846f-97dd-4478-a364-9c1dc4405d98"><ac:parameter ac:name="language">cpp</ac:parameter><ac:parameter ac:name="theme">Confluence</ac:parameter><ac:parameter ac:name="title">Shader Code</ac:parameter><ac:plain-text-body></ac:plain-text-body></ac:structured-macro></div>

 |
|

<div class="content-wrapper">

<ac:image ac:height="250"><ri:attachment ri:filename="Liquid2.png"></ri:attachment></ac:image>

2) <span>Render the **back faces** of the volume.</span>

<span>We don't draw pixels that are on a higher position than the cutting level.</span>

</div>

 |

<div class="content-wrapper"><ac:structured-macro ac:name="code" ac:schema-version="1" ac:macro-id="ecca5366-0586-4ec3-84ba-cbafd3269391"><ac:parameter ac:name="language">cpp</ac:parameter><ac:parameter ac:name="theme">Confluence</ac:parameter><ac:parameter ac:name="title">Shader Code</ac:parameter> <ac:plain-text-body>_FillLevel) // Current pixel is above fill level - discard and let glass show through: discard; return _SurfaceColor; } ENDCG }]]></ac:plain-text-body></ac:structured-macro></div>

 |
|

<div class="content-wrapper">

<ac:image ac:height="250"><ri:attachment ri:filename="Liquid3.png"></ri:attachment></ac:image>

3) <span>Draw the **front faces** on top.</span>

<span>The areas where the backfaces are not covered by the front faces define the **surface** of the liquid.</span>

</div>

 |

<div class="content-wrapper"><ac:structured-macro ac:name="code" ac:schema-version="1" ac:macro-id="dde79486-526b-46ba-ba7f-d168aeada5df"><ac:parameter ac:name="language">cpp</ac:parameter><ac:parameter ac:name="theme">Confluence</ac:parameter><ac:parameter ac:name="title">Shader Code</ac:parameter> <ac:plain-text-body>_FillLevel) // Current pixel is above fill level - discard it and let backfaces show through: discard; return _LiquidColor; } ENDCG }]]></ac:plain-text-body></ac:structured-macro></div>

 |

A similar technique can be used to render a cross section. We need to use the stencil buffer for this:

<colgroup><col style="width: 33.1797%;"><col style="width: 66.8203%;"></colgroup>
|

<div class="content-wrapper">

<ac:image ac:height="250"><ri:attachment ri:filename="CrossSection1.png"></ri:attachment></ac:image>

1) Render every pixel of the **front faces** that is **above** the cross section plane into the stencil buffer.

</div>

 |

<div class="content-wrapper"><ac:structured-macro ac:name="code" ac:schema-version="1" ac:macro-id="59d47f34-daad-4d49-9923-e021708f938a"><ac:parameter ac:name="language">cpp</ac:parameter><ac:parameter ac:name="theme">Confluence</ac:parameter><ac:parameter ac:name="title">Shader Code</ac:parameter><ac:plain-text-body></ac:plain-text-body></ac:structured-macro></div>

 |
|

<div class="content-wrapper">

<ac:image ac:height="250"><ri:attachment ri:filename="CrossSection2.png"></ri:attachment></ac:image>

2) Draw every pixel the **back faces** that is **below** the cross section plane. Use the stecil buffer as a mask so you get...

</div>

 |

<div class="content-wrapper"><ac:structured-macro ac:name="code" ac:schema-version="1" ac:macro-id="14fc54e2-9834-4d06-8926-69e7013be692"><ac:parameter ac:name="language">cpp</ac:parameter><ac:parameter ac:name="theme">Confluence</ac:parameter><ac:parameter ac:name="title">Shader Code</ac:parameter> <ac:plain-text-body>0) discard; return fixed4(1, 0, 0, 1); } ENDCG }]]></ac:plain-text-body></ac:structured-macro></div>

 |
|

<div class="content-wrapper"><ac:image ac:height="250"><ri:attachment ri:filename="CrossSection3.png"></ri:attachment></ac:image>

... the cross section.

</div>

 |

### Notes

*   The actual implementation of the cross section shader is a bit more complicated because the technique above can generate issues if you have objects that overlap each other.
*   Rendering cross sections only works on watertight meshes. Many game obejcts have open edges though. An alternative to the crosss section is rendering the intersection of the faces with the plane. But since the faces don't have any thickness it's very likely that many will be missed.

# Calculate distance field on GPU

To render the distance field maps quickly I wanted to use the GPU to do the calculations. After some research I found this article about rendering fluids in Pixel Junk Shooter. They are using a technique called Jump Flooding to render distance field maps at runtime:

[https://www.scribd.com/document/198978376/PixelJunk-Shooter-Fluid-Sim-and-Rendering](https://www.scribd.com/document/198978376/PixelJunk-Shooter-Fluid-Sim-and-Rendering)

<ac:image ac:height="250"></ac:image>

## Jump Flooding Algorithm

The Jump Flooding Algorithm is a way to render distance field on the GPU:

[https://drive.google.com/file/d/0B6KgEWLqcKuWenQwTGczR0V0eDA/view](https://drive.google.com/file/d/0B6KgEWLqcKuWenQwTGczR0V0eDA/view)

I works like this:

1.  Take the obstacle map as an input
    <ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:9:2.png"></ri:attachment></ac:image>

2.  Render the uvs of the obstacle pixels
    <ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:13:44.png"></ri:attachment></ac:image>

3.  Compare each pixel with its 8 neighbors with an offset of half the image dimensions. Calculate the distance of the encoded uv to the current pixel. Take the uvs of the closest and draw it to the texture.
    <ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:14:8.png"></ri:attachment></ac:image>

4.  Repeat this process. With each iteration divide the offset by 2 until it reaches 1 and each pixel is compared with its direct neighbor.
    <ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:15:1.png"></ri:attachment></ac:image><ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:15:36.png"></ri:attachment></ac:image><ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:15:54.png"></ri:attachment></ac:image><ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:16:15.png"></ri:attachment></ac:image><ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:17:0.png"></ri:attachment></ac:image><ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:16:37.png"></ri:attachment></ac:image>

5.  A a last step calculate the distance from the encoded uv of each pixel to the current uv and render this to the texture.
    <ac:image ac:thumbnail="true" ac:height="150"><ri:attachment ri:filename="image2017-8-23 17:18:4.png"></ri:attachment></ac:image>

## Using GPU for Calculations in Unity

There are different ways to use the GPU for calculations in Unity:

<colgroup><col><col></colgroup>
| Technique |
|

Compute shader

 |

*   Different Language
*   Nils Schneider wrote an article about compute shaders:
    <ac:link></ac:link>

 |
| Custom Render Texture |

*   New feature of Unity 2017.1:
    [https://docs.unity3d.com/2017.1/Documentation/ScriptReference/CustomRenderTexture.html](https://docs.unity3d.com/2017.1/Documentation/ScriptReference/CustomRenderTexture.html)
*   Promising
*   Real Time
*   Crashes

 |
|

Combining Passes using Blit

 |

*   Technique used in Distance Field Generator
*   Used for post processing in Unity
*   Can use normal shader code
*   Works in editor

 |

I chose the third method because it was ease to implement and it also works in the Unity editor.

# Samples

Here are some examples of how to use the distance field maps

<colgroup><col style="width: 58.4254%;"><col style="width: 41.5746%;"></colgroup>
|

<div class="content-wrapper">

<ac:image ac:height="400"><ri:attachment ri:filename="DistanceFieldLoop.gif"></ri:attachment></ac:image>

</div>

 |

### Stripes

In this example I'm using the distance field map to look up values from another texture. This technique can be used for things like stilized water ripples.

 |
|

<div class="content-wrapper">

![](/assets/DistanceFieldLoop.gif){:width="300px"}

<ac:image ac:height="400"><ri:attachment ri:filename="image2017-8-24 17:19:10.png"></ri:attachment></ac:image>

</div>

 |

### Stripes 2

Another version with a disco texture...

 |
|

<div class="content-wrapper">

<ac:image ac:height="400"><ri:attachment ri:filename="image2017-8-24 17:21:6.png"></ri:attachment></ac:image>

</div>

 |

### Water

Simple water shader with waves around objects

 |
|

<div class="content-wrapper">

<ac:image ac:height="400"><ri:attachment ri:filename="image2017-8-24 17:23:54.png"></ri:attachment></ac:image>

</div>

 |

### Radial

Example of how to use the flow map to map textures radially around objects.

 |

# Future Improvements

*   Use only one render texture. Currently I'm using three internal textures
*   Make it even faster so it can be used at runtime
*   Support open edges. Currently obstacle meshes have to be watertight to render correct distance field maps


Download the Unity package: <ac:link><ri:attachment ri:filename="DIstanceFieldGenerator.unitypackage"></ri:attachment></ac:link>
