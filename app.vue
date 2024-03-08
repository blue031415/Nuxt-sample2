<script setup lang="ts">
const characterListInit = new Map<number, Character>();
characterListInit.set(1, {id: 1, name:"ルフィ", bounty: 100000000});
characterListInit.set(2, {id: 2, name:"ゾロ", bounty: 60000000});
const characterList = ref(characterListInit);

const totalBounty = computed(
  (): number =>{
    let total = 0;
    for(const character of characterList.value.values()){
      total += character.bounty;
    }
    return total;
  }
);

interface Character{
  id: number;
  name: string;
  bounty: number;
}
</script>

<template>
  <section>
    <h1>キャラクター名</h1>
    <p>懸賞金の合計:{{ totalBounty }}</p>
    <Onecharacter
      v-for="[id, character] in characterList"
      v-bind:key="id"
      v-bind:name="character.name"
      v-bind:bounty="character.bounty"/>
  </section>
</template>

<style>
section{
  border: blue 5px solid;
  margin: 10px;
}
</style>