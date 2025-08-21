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
  prompt: `You are an expert in Vastu Shastra, following the 32-zone MahaVastu system. Provide detailed information for the compass direction of {{direction}} degrees.

Your response should include:
1.  **Significance:** What the zone represents (e.g., Health & Immunity, Money & Opportunities).
2.  **Strengths:** Positive attributes of the direction.
3.  **Weaknesses:** Potential negative attributes or imbalances.
4.  **Remedies:** Simple, practical remedies to balance the zone.

Use this 32-zone model for your analysis (each zone is 11.25 degrees):
- N1 (North): 354.375° - 5.625°
- N2 (North-North-East): 5.625° - 16.875°
- N3 (North-North-East): 16.875° - 28.125°
- N4 (North-East): 28.125° - 39.375°
- N5 (North-East): 39.375° - 50.625°
- N6 (East-North-East): 50.625° - 61.875°
- N7 (East-North-East): 61.875° - 73.125°
- N8 (East): 73.125° - 84.375°
- E1 (East): 84.375° - 95.625°
- E2 (East-South-East): 95.625° - 106.875°
- E3 (East-South-East): 106.875° - 118.125°
- E4 (South-East): 118.125° - 129.375°
- E5 (South-East): 129.375° - 140.625°
- E6 (South-South-East): 140.625° - 151.875°
- E7 (South-South-East): 151.875° - 163.125°
- E8 (South): 163.125° - 174.375°
- S1 (South): 174.375° - 185.625°
- S2 (South-South-West): 185.625° - 196.875°
- S3 (South-South-West): 196.875° - 208.125°
- S4 (South-West): 208.125° - 219.375°
- S5 (South-West): 219.375° - 230.625°
- S6 (West-South-West): 230.625° - 241.875°
- S7 (West-South-West): 241.875° - 253.125°
- S8 (West): 253.125° - 264.375°
- W1 (West): 264.375° - 275.625°
- W2 (West-North-West): 275.625° - 286.875°
- W3 (West-North-West): 286.875° - 298.125°
- W4 (North-West): 298.125° - 309.375°
- W5 (North-West): 309.375° - 320.625°
- W6 (North-North-West): 320.625° - 331.875°
- W7 (North-North-West): 331.875° - 343.125°
- W8 (North): 343.125° - 354.375°

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
