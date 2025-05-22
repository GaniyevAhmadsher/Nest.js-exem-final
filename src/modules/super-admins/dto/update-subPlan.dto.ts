import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-subPlan.dto';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
