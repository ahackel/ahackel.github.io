<script lang="ts">
    import ShaderImage from "./ShaderImage.svelte";
    export let shaderUrls: string[];
    export let src: string;
    let shaderIndex: number = Math.floor(Math.random() * shaderUrls.length);
    let shaderUrl: string = shaderUrls[shaderIndex];
    
    async function next() {
        shaderIndex = (shaderIndex + 1) % shaderUrls.length;
        shaderUrl = shaderUrls[shaderIndex];
    }
</script>

<ShaderImage src={src} shaderUrl={shaderUrl} on:click={next} />