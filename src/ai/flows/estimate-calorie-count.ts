'use server';
/**
 * @fileOverview 卡路里估計 AI 代理。
 *
 * - estimateCalorieCount - 處理卡路里估計流程的函數。
 * - EstimateCalorieCountInput - estimateCalorieCount 函數的輸入類型。
 * - EstimateCalorieCountOutput - estimateCalorieCount 函數的返回類型。
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const EstimateCalorieCountInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "食物品項的照片，格式為 data URI，必須包含 MIME 類型並使用 Base64 編碼。預期格式：'data:<mimetype>;base64,<encoded_data>'。"
    ),
});
export type EstimateCalorieCountInput = z.infer<typeof EstimateCalorieCountInputSchema>;

// Updated Output Schema to include isFoodItem and adjusted descriptions
const EstimateCalorieCountOutputSchema = z.object({
  isFoodItem: z.boolean().describe('影像是否包含可辨識的食物品項。'),
  foodItem: z.string().describe('影像中辨識出的食物品項 (如果 isFoodItem 為 true)。如果不是食物，則為影像內容描述。 請使用繁體中文輸出此欄位。'), // Added request for Traditional Chinese
  calorieEstimate: z.number().describe('食物品項的估計卡路里數 (如果 isFoodItem 為 true)。如果不是食物，則為 0。'),
  confidence: z.number().describe('卡路里估計的信賴度（0-1）。如果 isFoodItem 為 false，則為 0。'), // Clarified confidence for non-food
});
export type EstimateCalorieCountOutput = z.infer<typeof EstimateCalorieCountOutputSchema>;

export async function estimateCalorieCount(
  input: EstimateCalorieCountInput
): Promise<EstimateCalorieCountOutput> {
  return estimateCalorieCountFlow(input);
}

// Updated Prompt Definition
const prompt = ai.definePrompt({
  name: 'estimateCalorieCountPrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "食物品項的照片，格式為 data URI，必須包含 MIME 類型並使用 Base64 編碼。預期格式：'data:<mimetype>;base64,<encoded_data>'。"
        ),
    }),
  },
  output: {
    // Use the updated output schema here
    schema: EstimateCalorieCountOutputSchema,
  },
  // Updated Prompt String to explicitly handle isFoodItem logic and request Traditional Chinese for foodItem
  prompt: `你是營養專家。請分析以下影像。

  1. 判斷影像中是否包含可辨識的食物品項。將此判斷結果設為 'isFoodItem' 欄位 (true 或 false)。
  2. 如果 'isFoodItem' 為 true：
     - 辨識主要的食物品項，並將其名稱設為 'foodItem'。**請務必以繁體中文輸出此名稱。**
     - 估計該食物品項的卡路里數，並將其設為 'calorieEstimate'。
     - 提供卡路里估計的信賴度（0 到 1 之間），並將其設為 'confidence'。
  3. 如果 'isFoodItem' 為 false：
     - 將 'foodItem' 設為影像內容的簡短描述 (**請以繁體中文輸出**，例如：「一本書」、「一隻貓」)。
     - 將 'calorieEstimate' 設為 0。
     - 將 'confidence' 設為 0。

  請嚴格遵循上述格式輸出。

  影像： {{media url=photoDataUri}}
  `,
});

const estimateCalorieCountFlow = ai.defineFlow<
  typeof EstimateCalorieCountInputSchema,
  typeof EstimateCalorieCountOutputSchema
>({
  name: 'estimateCalorieCountFlow',
  inputSchema: EstimateCalorieCountInputSchema,
  outputSchema: EstimateCalorieCountOutputSchema, // Use updated schema
},
async input => {
  const {output} = await prompt(input);
  // Ensure output matches the schema, especially when isFoodItem is false
  if (!output) {
     throw new Error("AI 流程未傳回有效的輸出。"); // Translated error
  }
  // The prompt now handles setting defaults for non-food items and language.
  // We rely on Genkit's schema validation (implicit in definePrompt/defineFlow)
  // to ensure the output conforms to EstimateCalorieCountOutputSchema.

   // Ensure foodItem is not empty, even if AI fails to provide one
   if (output.isFoodItem && !output.foodItem) {
       output.foodItem = "未命名食物"; // Default Traditional Chinese placeholder
   } else if (!output.isFoodItem && !output.foodItem) {
       output.foodItem = "未知影像"; // Default Traditional Chinese placeholder for non-food
   }

  return output;
});
