export class CreateFormDto {
  name: string;
  schema: object[]; // Array of field definitions
  subParameterId: string;
}
