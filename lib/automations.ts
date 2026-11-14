import {
  AutomationActionType,
  AutomationLog,
  AutomationRule,
  AutomationTriggerType,
  NotificationItem,
  TaskItem,
  TaskStage,
} from "./data"

export interface ParsedAutomationPreview {
  matched: boolean
  triggerType: AutomationTriggerType
  triggerValue?: string
  triggerLabel: string
  actionType: AutomationActionType
  actionValue?: string
  actionLabel: string
  hint: string
}

export const AUTOMATION_TEMPLATES: {
  label: string
  naturalText: string
}[] = [
  {
    label: "Concluir e avisar ao mover para Done",
    naturalText:
      "Quando tarefa for para Done, marcar como concluída e notificar equipe",
  },
  {
    label: "Prioridade Alta vai direto para In Progress",
    naturalText:
      "Quando prioridade for Alta, mover automaticamente para In Progress",
  },
  {
    label: "Notificar gerente ao aprovar entrega no Portal",
    naturalText:
      "Ao aprovar entrega no Portal do Cliente, notificar gerente do projeto",
  },
  {
    label: "Destacar revisão solicitada pelo cliente",
    naturalText:
      "Quando cliente solicitar revisão no Portal, notificar equipe com urgência",
  },
  {
    label: "Elevar prioridade quando entrar em Review",
    naturalText:
      "Quando tarefa for para Review, definir prioridade Alta e notificar equipe",
  },
]

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

export function parseNaturalAutomationRule(
  rawText: string
): ParsedAutomationPreview {
  const norm = normalizeText(rawText)

  // Detect Trigger
  let triggerType: AutomationTriggerType = "stage_change"
  let triggerValue: string | undefined = "DONE"
  let triggerLabel = "Estágio muda para Done"
  let triggerMatched = false

  if (
    norm.includes("portal") &&
    (norm.includes("aprov") || norm.includes("approv"))
  ) {
    triggerType = "portal_approved"
    triggerValue = "approved"
    triggerLabel = "Entrega aprovada no Portal"
    triggerMatched = true
  } else if (
    norm.includes("portal") &&
    (norm.includes("revis") || norm.includes("altera") || norm.includes("change"))
  ) {
    triggerType = "portal_changes_requested"
    triggerValue = "changes_requested"
    triggerLabel = "Revisão solicitada no Portal"
    triggerMatched = true
  } else if (
    norm.includes("prioridade") &&
    (norm.includes("alta") || norm.includes("high"))
  ) {
    triggerType = "priority_high"
    triggerValue = "High"
    triggerLabel = "Prioridade definida como Alta"
    triggerMatched = true
  } else if (
    norm.includes("concluid") ||
    norm.includes("finaliz") ||
    norm.includes("complet")
  ) {
    if (norm.includes("para done") || norm.includes("para concluido")) {
      triggerType = "stage_change"
      triggerValue = "DONE"
      triggerLabel = "Estágio muda para Done"
    } else {
      triggerType = "task_completed"
      triggerValue = "true"
      triggerLabel = "Tarefa marcada como concluída"
    }
    triggerMatched = true
  } else if (
    norm.includes("review") ||
    norm.includes("revisao") ||
    norm.includes("em revisao")
  ) {
    triggerType = "stage_change"
    triggerValue = "REVIEW"
    triggerLabel = "Estágio muda para In Review"
    triggerMatched = true
  } else if (
    norm.includes("in progress") ||
    norm.includes("em andamento") ||
    norm.includes("progresso")
  ) {
    triggerType = "stage_change"
    triggerValue = "IN PROGRESS"
    triggerLabel = "Estágio muda para In Progress"
    triggerMatched = true
  } else if (norm.includes("done") || norm.includes("feito")) {
    triggerType = "stage_change"
    triggerValue = "DONE"
    triggerLabel = "Estágio muda para Done"
    triggerMatched = true
  } else if (norm.includes("todo") || norm.includes("a fazer")) {
    triggerType = "stage_change"
    triggerValue = "TODO"
    triggerLabel = "Estágio muda para To Do"
    triggerMatched = true
  }

  // Split after comma or "entao"/"then" when looking for action so trigger keywords don't bleed
  const parts = norm.split(/,|entao|->|=>|\bthen\b/)
  const actionSegment = parts.length > 1 ? parts.slice(1).join(" ") : norm

  // Detect Action
  let actionType: AutomationActionType = "notify_team"
  let actionValue: string | undefined = "team"
  let actionLabel = "Enviar alerta na Central de Notificações"
  let actionMatched = false

  if (
    actionSegment.includes("mover") ||
    actionSegment.includes("move") ||
    actionSegment.includes("enviar para")
  ) {
    if (
      actionSegment.includes("in progress") ||
      actionSegment.includes("andamento")
    ) {
      actionType = "move_stage"
      actionValue = "IN PROGRESS"
      actionLabel = "Mover para In Progress"
      actionMatched = true
    } else if (
      actionSegment.includes("review") ||
      actionSegment.includes("revisao")
    ) {
      actionType = "move_stage"
      actionValue = "REVIEW"
      actionLabel = "Mover para In Review"
      actionMatched = true
    } else if (
      actionSegment.includes("done") ||
      actionSegment.includes("concluid")
    ) {
      actionType = "move_stage"
      actionValue = "DONE"
      actionLabel = "Mover para Done"
      actionMatched = true
    } else if (actionSegment.includes("todo")) {
      actionType = "move_stage"
      actionValue = "TODO"
      actionLabel = "Mover para To Do"
      actionMatched = true
    }
  } else if (
    actionSegment.includes("prioridade alta") ||
    actionSegment.includes("definir prioridade") ||
    actionSegment.includes("high priority")
  ) {
    actionType = "set_priority"
    actionValue = "High"
    actionLabel = "Definir prioridade como Alta"
    actionMatched = true
  } else if (
    actionSegment.includes("marcar como conclu") ||
    actionSegment.includes("concluir") ||
    actionSegment.includes("completar")
  ) {
    actionType = "mark_completed"
    actionValue = actionSegment.includes("notificar") ? "notify" : "only"
    actionLabel = actionSegment.includes("notificar")
      ? "Concluir tarefa e notificar equipe"
      : "Marcar tarefa como concluída"
    actionMatched = true
  } else if (
    actionSegment.includes("notificar") ||
    actionSegment.includes("avisar") ||
    actionSegment.includes("alertar") ||
    actionSegment.includes("notify")
  ) {
    actionType = "notify_team"
    actionValue = actionSegment.includes("gerente") ? "manager" : "team"
    actionLabel = actionSegment.includes("gerente")
      ? "Notificar gerente do projeto"
      : "Notificar equipe na Central"
    actionMatched = true
  }

  const matched = Boolean(norm.length >= 8 && (triggerMatched || actionMatched))

  return {
    matched,
    triggerType,
    triggerValue,
    triggerLabel,
    actionType,
    actionValue,
    actionLabel,
    hint: matched
      ? "Regra reconhecida e pronta para executar localmente."
      : "Descreva um gatilho (ex.: 'Quando tarefa for para Done...') e uma ação (ex.: '...notificar equipe').",
  }
}

export interface AutomationEvaluationInput {
  eventType: AutomationTriggerType
  eventValue?: string
  targetLabel: string
  taskId?: string
}

export interface AutomationEvaluationResult {
  updatedRules: AutomationRule[]
  newLogs: AutomationLog[]
  newNotifications: NotificationItem[]
  taskPatches: {
    taskId: string
    completed?: boolean
    stage?: TaskStage
    priority?: TaskItem["priority"]
  }[]
}

export function evaluateAutomationRules(
  rules: AutomationRule[],
  input: AutomationEvaluationInput,
  timestampLabel: string
): AutomationEvaluationResult {
  const newLogs: AutomationLog[] = []
  const newNotifications: NotificationItem[] = []
  const taskPatches: AutomationEvaluationResult["taskPatches"] = []

  const updatedRules = rules.map((rule) => {
    if (!rule.enabled) return rule
    if (rule.triggerType !== input.eventType) return rule

    if (
      rule.triggerValue &&
      input.eventValue &&
      rule.triggerValue.toLowerCase() !== input.eventValue.toLowerCase()
    ) {
      return rule
    }

    // Rule triggered!
    let outcome = rule.actionLabel

    if (rule.actionType === "mark_completed" && input.taskId) {
      taskPatches.push({
        taskId: input.taskId,
        completed: true,
        stage: "DONE",
      })
      outcome = "Tarefa marcada como concluída"
      if (rule.actionValue === "notify") {
        newNotifications.push({
          id: `notif-auto-${Date.now()}-${rule.id}`,
          title: "Automação executada",
          description: `Regra "${rule.naturalText}" disparada em "${input.targetLabel}".`,
          time: timestampLabel,
          read: false,
          type: "automation",
        })
      }
    } else if (
      rule.actionType === "move_stage" &&
      input.taskId &&
      rule.actionValue
    ) {
      const nextStage = rule.actionValue as TaskStage
      taskPatches.push({
        taskId: input.taskId,
        stage: nextStage,
        completed: nextStage === "DONE" ? true : undefined,
      })
      outcome = `Movida para ${nextStage}`
    } else if (rule.actionType === "set_priority" && input.taskId) {
      taskPatches.push({
        taskId: input.taskId,
        priority: "High",
      })
      outcome = "Prioridade elevada para Alta"
    }

    if (
      rule.actionType === "notify_team" ||
      rule.actionType === "set_priority"
    ) {
      newNotifications.push({
        id: `notif-auto-${Date.now()}-${rule.id}`,
        title: "Automação disparada",
        description: `${rule.actionLabel}: ${input.targetLabel}`,
        time: timestampLabel,
        read: false,
        type: "automation",
      })
    }

    newLogs.push({
      id: `alog-${Date.now()}-${rule.id}`,
      ruleId: rule.id,
      ruleText: rule.naturalText,
      targetLabel: input.targetLabel,
      outcome,
      timestamp: timestampLabel,
    })

    return {
      ...rule,
      runsCount: rule.runsCount + 1,
    }
  })

  return {
    updatedRules,
    newLogs,
    newNotifications,
    taskPatches,
  }
}
