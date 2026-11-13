import type { MapNode, PanoramaNode } from "@/types/map"
import nodesJson from "./nodes.json"
import siegeNodesJson from "./siege-nodes.json"
import panoramsJson from "./panorams.json"

export const nodes = nodesJson as MapNode[]
export const siegeNodes = siegeNodesJson as MapNode[]
export const panoramas = panoramsJson as PanoramaNode[]
