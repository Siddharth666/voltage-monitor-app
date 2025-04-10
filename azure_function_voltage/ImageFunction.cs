using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs;
using System.Linq;
using System;

public class ImageFunctions
{
    private readonly ILogger<ImageFunctions> _logger;
    private const string BlobContainerName = "images";  // Change this to your actual container name
    private readonly BlobServiceClient _blobServiceClient;

    public ImageFunctions(ILogger<ImageFunctions> logger)
    {
        _logger = logger;
        _blobServiceClient = new BlobServiceClient(Environment.GetEnvironmentVariable("AzureWebJobsStorage"));
    }

    /// <summary>
    /// Upload an image to Azure Blob Storage
    /// </summary>
    [FunctionName("UploadImageFunction")]
    public async Task<IActionResult> UploadImageAsync(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "upload")] HttpRequest req)
    {
        _logger.LogInformation("Processing image upload request...");

        if (!req.Form.Files.Any())
        {
            return new BadRequestObjectResult("No file uploaded.");
        }

        var file = req.Form.Files[0];
        var fileName = Path.GetFileName(file.FileName);

        // Get reference to blob container
        var blobContainerClient = _blobServiceClient.GetBlobContainerClient(BlobContainerName);
        //await blobContainerClient.CreateIfNotExistsAsync(PublicAccessType.Blob); // Ensure container exists
        await blobContainerClient.CreateIfNotExistsAsync(Azure.Storage.Blobs.Models.PublicAccessType.Blob);


        // Upload file to blob storage
        var blobClient = blobContainerClient.GetBlobClient(fileName);
        using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, true);

        var blobUrl = blobClient.Uri.AbsoluteUri;
        _logger.LogInformation($"Image uploaded successfully: {blobUrl}");

        return new OkObjectResult(new { message = "Image uploaded", url = blobUrl });
    }

    /// <summary>
    /// Get an image URL from Azure Blob Storage
    /// </summary>
    [FunctionName("GetImageUrlFunction")]
    public async Task<IActionResult> GetImageUrlAsync(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "image/{fileName}")] HttpRequest req, string fileName)
    {
        _logger.LogInformation($"Fetching image URL for: {fileName}");
  
        var blobContainerClient = _blobServiceClient.GetBlobContainerClient(BlobContainerName);
        var blobClient = blobContainerClient.GetBlobClient(fileName);


        if (await blobClient.ExistsAsync())
        {
            return new OkObjectResult(new { url = blobClient.Uri.AbsoluteUri });
        }
        else
        {
            return new NotFoundObjectResult("Image not found.");
        }
    }
}


//Test CICD