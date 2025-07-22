import { CHAT_GPT4_MINI_MODEL, openai } from '../../../lib/tools/openai';

export enum Agent {
  artemis = 'artemis',
  hermes = 'hermes',
  hades = 'hades',
  athena = 'athena',
  apollo = 'apollo',
  apolloExpense = 'apolloExpense',
  preSubscription = 'preSubscription',
  inactiveSubscription = 'inactiveSubscription'
}

export const chooseAgent = async (message: string) => {
  const prompt = `Clasify the following message into one of the predefined categories (agents). Respond with a JSON containing the detected agent to handle the request.

Categories (Agents):
	•	artemis - Agente de Gastos: Encargado de registrar y gestionar gastos. También conoce las categorías de gastos.
    • registerExpenses
    •	createExpenseCategory
    •	getSpending
    •	findSpendings
	•	hermes - Agente de Ingresos: Encargado de registrar y gestionar ingresos. También conoce las categorías de ingresos.
    • registerIncomes
    •	createIncomeCategory
    •	getIncome
    •	findIncomes
	•	hades - Agente de Transferencias y Cuentas: Encargado de transferencias y gestión de cuentas.
    •	transferMoneyBetweenAccounts
    •	createFinancialAccount
    •	getTransfers
    •	findTransfers
    •	getAccountBalance
	•	athena - Agente de Presupuesto y Ahorros: Encargada de presupuestos y ahorros.
    • setBudget
    •	getBudget
    •	setExpenseCategoryBudget
    •	getBudgetByCategory
    •	getSavings
	•	apollo - Agente de Supervisión: El coordinador principal, encargado de delegar las solicitudes y atender dudas generales de los usuarios.
    • callForCustomerSupport
    • saveUserFeedback
    • saveUserProfileInsights

Last Messages:
${message}

Response Format (string to be parsed as JSON):
{
    "assigned_agent": "<enum-type>" like "artemis" or "hermes" or "hades" or "athena" or "apollo"
}

Instructions for AI Model:
	•	Detect the appropriate agent to handle the user's request based on the provided message.
	•	Respond with a stringified JSON containing the assigned agent.
	•	If the message doesn't fit into any of the categories, specify it as apollo or hephaestus if it's a general or technical request respectively.
	•	Apolo should be selected as the default agent for general or ambiguous requests..`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: CHAT_GPT4_MINI_MODEL,
    temperature: 0.05,
    response_format: { type: 'json_object' }
  });

  const response = chatCompletion.choices[0].message.content;

  if (!response) {
    throw new Error("Model doesn't respond with a message");
  }

  console.log('Response from AI Model:', response);

  const responseJSON = JSON.parse(response);

  if (!responseJSON.assigned_agent) {
    throw new Error("Model doesn't respond with a message type");
  }

  const messageClassification = Object.entries(Agent).find(
    ([key, value]) => value === responseJSON.assigned_agent
  );

  if (!messageClassification) {
    throw new Error("Model doesn't respond with a valid message type");
  }

  return messageClassification[0] as keyof typeof Agent;
};
