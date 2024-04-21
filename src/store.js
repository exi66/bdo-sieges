import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAppStore = defineStore('app', () => {
  const data = ref({})
  async function getResultJson() {
    let res = await axios.get('./result.json?' + new Date().getTime())
    data.value = res.data
  }
  const guildRankList = computed(() => {
    if (!data.value?.guildRankList) return []
    return data.value.guildRankList
  })
  const getNodesOwners = computed(() => {
    return guildRankList.value.filter((e) => e.C_spotSiegeCount)
  })
  const getCastlesOwners = computed(() => {
    return guildRankList.value.filter((e) => e.C_regionKey1 || e.C_regionKey2 || e.C_regionKey3)
  })
  const getCalpheonOwner = computed(() => {
    return getCastlesOwners.value.find(
      (e) => e.C_regionKey1 == 77 || e.C_regionKey2 == 77 || e.C_regionKey3 == 77
    )
  })
  const getBalenosOwner = computed(() => {
    return getCastlesOwners.value.find(
      (e) => e.C_regionKey1 == 5 || e.C_regionKey2 == 5 || e.C_regionKey3 == 5
    )
  })
  const getMediahOwner = computed(() => {
    return getCastlesOwners.value.find(
      (e) => e.C_regionKey1 == 202 || e.C_regionKey2 == 202 || e.C_regionKey3 == 202
    )
  })
  const getValenciaOwner = computed(() => {
    return getCastlesOwners.value.find(
      (e) => e.C_regionKey1 == 229 || e.C_regionKey2 == 229 || e.C_regionKey3 == 229
    )
  })
  return {
    getResultJson,
    guildRankList,
    getNodesOwners,
    getCastlesOwners,
    getCalpheonOwner,
    getBalenosOwner,
    getMediahOwner,
    getValenciaOwner
  }
})

export const useMapStore = defineStore('map', () => {
  const data = ref({})
})
