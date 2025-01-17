import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TrackService } from './track.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetTrackDto } from './dto/get-track.dto';
import { OptionalJwtGuard } from 'src/auth/guard/optional-jwt.guard';
import { GetUser } from 'src/auth/decorator';

@ApiTags('Track')
@Controller('track')
export class TrackController {
  constructor(private trackService: TrackService) {}

  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  @ApiBearerAuth() // this is optional, unsure if it's shown in the docs
  async getTrack(
    @Param() param: GetTrackDto,
    @GetUser('id') userId: number | null,
  ) {
    return this.trackService.getTrack(param, userId);
  }
}
