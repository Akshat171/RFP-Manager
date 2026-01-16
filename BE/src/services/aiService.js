const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const parseRFPDescription = async (description, availableCategories = []) => {
  try {
    // Create a more detailed prompt with available categories
    const categoriesHint = availableCategories.length > 0
      ? `Available vendor categories in the system: ${availableCategories.join(', ')}`
      : '';

    const systemPrompt = `You are a professional procurement assistant. Extract the following fields from the user's request:
    - items (array of objects with name, specs, quantity)
    - budget (number)
    - deadline (ISO date)
    - paymentTerms (string)
    - warranty (string)
    - category (string) - Determine the MOST RELEVANT primary category for this procurement request. ${categoriesHint}
    - suggestedCategories (array of strings) - List ALL relevant vendor categories that could fulfill this request, ordered by relevance

    Category Guidelines:
    - For laptops, computers, servers, networking equipment → "Hardware"
    - For software licenses, SaaS, applications → "Software"
    - For consulting, support, maintenance → "Services"
    - For security tools, penetration testing, compliance → "Cybersecurity"
    - For automation tools, CI/CD, workflows → "DevOps & Automation"
    - For furniture, stationery, general supplies → "Office Supplies"

    IMPORTANT: Choose the category that BEST matches the items being requested. If requesting laptops, the category should be "Hardware", not "Services".

    If a value is missing, return null for that field. Return ONLY JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: description },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Lower temperature for more consistent categorization
    });

    const content = response.choices[0].message.content;
    const parsedData = JSON.parse(content);

    console.log('AI extracted category:', parsedData.category);
    console.log('AI suggested categories:', parsedData.suggestedCategories);

    return parsedData;
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    throw new Error('Failed to parse RFP description with AI');
  }
};

const parseProposalEmail = async (emailBody) => {
  try {
    const systemPrompt = `You are a professional procurement assistant analyzing vendor proposal emails. Extract the following fields from the vendor's proposal email:
    - totalPrice (number) - The total quoted price
    - deliveryDate (ISO date) - Proposed delivery date
    - warrantyProvided (string) - Warranty terms offered
    - notes (string) - Any additional important information or conditions

    If a value is missing or not mentioned, return null for that field. Return ONLY JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: emailBody },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    const parsedData = JSON.parse(content);

    return parsedData;
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    throw new Error('Failed to parse proposal email with AI');
  }
};

const compareProposalToRFP = async (rfpData, proposalData) => {
  try {
    const systemPrompt = `You are a professional procurement analyst. Compare the vendor's proposal against the RFP requirements and determine if the vendor fulfills all requirements.

Analyze the following:
1. Price: Does the proposal price fit within the budget?
2. Delivery Date: Does the proposed delivery meet the deadline?
3. Warranty: Does the warranty offered meet or exceed requirements?
4. Overall Compliance: Are all conditions satisfied?

Return JSON with:
- fulfilled (boolean) - true if ALL requirements are met, false otherwise
- reasons (array of strings) - List of specific issues or confirmations (e.g., "Price exceeds budget by $500", "Delivery date meets deadline", "No warranty provided but required")
- summary (string) - Brief overall assessment (1-2 sentences)

Be strict: if ANY requirement is not met, set fulfilled to false.`;

    const userPrompt = `RFP Requirements:
${JSON.stringify(rfpData, null, 2)}

Vendor Proposal:
${JSON.stringify(proposalData, null, 2)}

Compare and analyze compliance.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    const complianceResult = JSON.parse(content);

    return complianceResult;
  } catch (error) {
    console.error('OpenAI API Error in compareProposalToRFP:', error.message);
    throw new Error('Failed to compare proposal to RFP with AI');
  }
};

module.exports = {
  parseRFPDescription,
  parseProposalEmail,
  compareProposalToRFP,
};
