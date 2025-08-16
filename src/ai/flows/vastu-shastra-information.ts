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
  vastuInfo: z.string().describe('Vastu Shastra information for the given direction.'),
});
export type VastuShastraInformationOutput = z.infer<typeof VastuShastraInformationOutputSchema>;

export async function vastuShastraInformation(input: VastuShastraInformationInput): Promise<VastuShastraInformationOutput> {
  return vastuShastraInformationFlow(input);
}

const vastuShastraInformationPrompt = ai.definePrompt({
  name: 'vastuShastraInformationPrompt',
  input: {schema: VastuShastraInformationInputSchema},
  output: {schema: VastuShastraInformationOutputSchema},
  prompt: `You are an expert in Vastu Shastra. Provide information and predictions based on Vastu Shastra principles for the following compass direction: {{direction}} degrees.

Consider these directions as:
North: Represents wealth and career.
East: Represents social connections and overall well-being.
South: Represents strength and fame.
West: Represents peace and prosperity.
Northeast: Represents spiritual growth and knowledge.
Southeast: Represents passion and creativity.
Southwest: Represents skills and stability.
Northwest: Represents support and change.

Give vastu shastra information in brief.
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
