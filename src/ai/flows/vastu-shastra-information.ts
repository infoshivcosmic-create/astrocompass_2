'use server';
/**
 * @fileOverview This file defines a Genkit flow to provide Vastu Shastra information based on compass direction.
 *
 * @exports vastuShastraInformation - A function that returns Vastu Shastra information for a given direction.
 * @exports VastuShastraInformationInput - The input type for the vastuShastraInformation function.
 * @exports VastuShastraInformationOutput - The output type for the vastuShastraInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VastuShastraInformationInputSchema = z.object({
  direction: z.number().describe('The compass direction in degrees.'),
});
export type VastuShastraInformationInput = z.infer<typeof VastuShastraInformationInputSchema>;

const VastuShastraInformationOutputSchema = z.object({
  vastuInfo: z.string().describe('Vastu Shastra information including significance, strengths, weaknesses, and remedies for the given direction.'),
});
export type VastuShastraInformationOutput = z.infer<typeof VastuShastraInformationOutputSchema>;

export async function vastuShastraInformation(input: VastuShastraInformationInput): Promise<VastuShastraInformationOutput> {
  return vastuShastraInformationFlow(input);
}

const vastuShastraInformationPrompt = ai.definePrompt({
  name: 'vastuShastraInformationPrompt',
  input: {schema: VastuShastraInformationInputSchema},
  output: {schema: VastuShastraInformationOutputSchema},
  prompt: `You are an expert in Vastu Shastra, following the 16-zone MahaVastu system. Provide detailed information for the compass direction of {{direction}} degrees.

Your response should include:
1.  **Significance:** What the zone represents (e.g., Health & Immunity, Money & Opportunities).
2.  **Strengths:** Positive attributes of the direction.
3.  **Weaknesses:** Potential negative attributes or imbalances.
4.  **Remedies:** Simple, practical remedies to balance the zone.

Use this 16-zone model for your analysis:
- North (N): 348.75° - 11.25°
- North-North-East (NNE): 11.25° - 33.75°
- North-East (NE): 33.75° - 56.25°
- East-North-East (ENE): 56.25° - 78.75°
- East (E): 78.75° - 101.25°
- East-South-East (ESE): 101.25° - 123.75°
- South-East (SE): 123.75° - 146.25°
- South-South-East (SSE): 146.25° - 168.75°
- South (S): 168.75° - 191.25°
- South-South-West (SSW): 191.25° - 213.75°
- South-West (SW): 213.75° - 236.25°
- West-South-West (WSW): 236.25° - 258.75°
- West (W): 258.75° - 281.25°
- West-North-West (WNW): 281.25° - 303.75°
- North-West (NW): 303.75° - 326.25°
- North-North-West (NNW): 326.25° - 348.75°

Provide the information in a clear, concise, and easy-to-understand format.
`,
});

const vastuShastraInformationFlow = ai.defineFlow(
  {
    name: 'vastuShastraInformationFlow',
    inputSchema: VastuShastraInformationInputSchema,
    outputSchema: VastuShastraInformationOutputSchema,
  },
  async input => {
    const {output} = await vastuShastraInformationPrompt(input);
    return output!;
  }
);
