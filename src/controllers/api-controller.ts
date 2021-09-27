import {Body, Controller, Get, Path, Post, Query, Route, Tags, SuccessResponse} from "tsoa";
import {
  IUser,
  ISaveRequest,
  ISaveResponse,
  DataService
} from "../services/data-service";

@Route("api")
@Tags("API")
export class ApiController extends Controller {
  /**
   * Save information for encrypted saving.
   * Supply payload and public key.
   * @param payload include firstname, lastname, passport
   * @param publicKey Provide your publicKey
   */
  @SuccessResponse("201", "Created")
  @Post()
  public async save(@Body() requestBody: ISaveRequest): Promise<ISaveResponse> {
    this.setStatus(201);
    return await new DataService().save(requestBody);
  }

  /**
   * Retrieves decrypted information.
   * Supply the data key which was returned in response to save request.
   */
  @SuccessResponse("200", "OK")
  @Get("{id}")
  public async get(@Path() id: string, @Query() key: string): Promise<IUser> {
    return await new DataService().get(id, key);
  }
}
