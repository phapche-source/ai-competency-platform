import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IamService } from './iam.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Controller('profiles')
export class IamController {
  constructor(private readonly service: IamService) {}

  @Post()
  create(@Body() dto: CreateProfileDto) {
    return this.service.createProfile(dto);
  }

  @Get(':userId')
  get(@Param('userId') userId: string) {
    return this.service.getProfile(userId);
  }
}
