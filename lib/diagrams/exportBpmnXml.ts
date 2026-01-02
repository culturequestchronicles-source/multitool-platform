import type { Node, Edge } from "@xyflow/react";
import type { BpmnNodeData } from "@/lib/diagrams/bpmnRules";

const NODE_KIND_TO_TAG: Record<string, string> = {
  start_event: "bpmn:startEvent",
  end_event: "bpmn:endEvent",
  task: "bpmn:task",
  subprocess: "bpmn:subProcess",
  gateway_xor_split: "bpmn:exclusiveGateway",
  gateway_xor_merge: "bpmn:exclusiveGateway",
  intermediate_message: "bpmn:intermediateCatchEvent",
  intermediate_timer: "bpmn:intermediateCatchEvent",
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function exportBpmnXml(
  nodes: Node[],
  edges: Edge[],
  { title }: { title: string }
) {
  const processId = `Process_${Date.now()}`;
  const defsId = `Definitions_${Date.now()}`;

  const bpmnNodes = nodes.filter((node) => {
    const data = node.data as BpmnNodeData | undefined;
    return data?.kind && data.kind !== ("swimlane" as any);
  });

  const nodeXml = bpmnNodes
    .map((node) => {
      const data = node.data as BpmnNodeData;
      const tag = NODE_KIND_TO_TAG[data.kind];
      if (!tag) return "";
      const name = data.label ? ` name="${escapeXml(data.label)}"` : "";
      return `    <${tag} id="${escapeXml(node.id)}"${name} />`;
    })
    .filter(Boolean)
    .join("\n");

  const edgeXml = edges
    .map((edge) => {
      return `    <bpmn:sequenceFlow id="${escapeXml(edge.id)}" sourceRef="${escapeXml(
        edge.source
      )}" targetRef="${escapeXml(edge.target)}" />`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="${defsId}" targetNamespace="http://example.com/bpmn">\n  <bpmn:process id="${processId}" name="${escapeXml(title || "Diagram")}" isExecutable="false">\n${nodeXml}\n${edgeXml}\n  </bpmn:process>\n</bpmn:definitions>\n`;
}
