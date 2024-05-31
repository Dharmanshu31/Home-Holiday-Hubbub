import { IsNotEmpty, IsString } from 'class-validator';

export class GeminiAIDto {
  @IsString()
  @IsNotEmpty()
  userPrompt: string;
}
