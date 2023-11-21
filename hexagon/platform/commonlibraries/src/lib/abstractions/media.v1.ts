/**
 * Represents media
 */
export class Media$v1 {
  /** Id associated with the media */
  id: string;

  /** External Id associated with the media */
  externalId: string;

  /** The type associated with the media */
  contentType?: string;

  /** File size of media in bytes */
  contentLength?: number;

  /** The time the media was last modified */
  lastModifiedTime?: Date;

  /** The friendly name of the media (What the author named it) */
  name?: string;

  /** The actual file name of the media */
  fileName?: string;

  /**  Gets or sets a value indicating whether the media is loaded and ready for use*/
  isUploaded?: boolean;

  /** Id of the entity the media is associated to */
  entityId?: string;

  /** URL to file in blob. This property is not set by the REST api */
  /** For videos, this represents the browser blob storage url */
  url?: string;

  /** The uri to fetch the attachment content */
  uri?: string;

  /** The time that the content uri is due to expire */
  uriExpirationTime?: string;

  constructor(params: Media$v1 = {} as Media$v1) {
    const {
      id = null,
      externalId = null,
      contentType = null,
      contentLength = null,
      lastModifiedTime = null,
      name = null,
      fileName = null,
      isUploaded = false,
      url = null,
      entityId = null,
      uri = null,
      uriExpirationTime = null,
    } = params;

    this.id = id;
    this.externalId = externalId;
    this.contentType = contentType;
    this.contentLength = contentLength;
    this.lastModifiedTime = lastModifiedTime;
    this.name = name;
    this.fileName = fileName;
    this.isUploaded = isUploaded;
    this.url = url;
    this.entityId = entityId;
    this.uri = uri;
    this.uriExpirationTime = uriExpirationTime;
  }

  /**
   * Returns the file size in megabytes
   * @param round If true will round to two decimal places
   */
  getSizeMegabytes(round = true): number {
    const sizeMb = this.contentLength * 0.000001;
    if (round) {
      return Math.round(sizeMb * 100) / 100;
    }

    return sizeMb;
  }
}
