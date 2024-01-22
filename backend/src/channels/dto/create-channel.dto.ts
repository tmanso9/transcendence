import {
  IsNotEmpty,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class ChannelTypeRule implements ValidatorConstraintInterface {
  constructor() {}

  async validate(type: string) {
    return type === 'PERSONAL' || type === 'PRIVATE' || type === 'PUBLIC';
  }

  defaultMessage() {
    return `Invalid channel type`;
  }
}

export class CreateChannelDTO {
  @IsString()
  @IsNotEmpty()
  creator: string;

  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  channelName: string;

  @IsNotEmpty()
  @Validate(ChannelTypeRule)
  channelType: any;
}
