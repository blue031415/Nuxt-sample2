<script setup lang = "ts">

interface Props{
    name: string;
    bounty: number;
}

const props = defineProps<Props>();

const bounty = ref(props.bounty);

const bountyUp = (): void =>{
    bounty.value += 1000;
}
</script>

<template>
    <section class = "box">
        <p>{{ name }}</p>
        <p>懸賞金:{{ bounty }}ベリー</p>
        <button v-on:click = "bountyUp">懸賞金アップ</button>
    </section>
</template>

<style scoped>
.box{
    border: black 5px solid;
    margin: 3px;
    padding: 10px;
}
</style>