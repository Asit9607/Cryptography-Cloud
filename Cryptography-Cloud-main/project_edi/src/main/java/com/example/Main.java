package com.example;

import java.io.File;

import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

public class Main {

    public static void main(String[] args) {
        // Specify your region and bucket name
        Region region = Region.EU_NORTH_1; // Use your configured region
        String bucketName = "my-project-01-bucket"; // Replace with your bucket name

        // Path to the file you want to upload
        String filePath = "D:\\SEM 5\\EDI\\New folder\\input.txt";
        String keyName = "stored.txt"; // The name you want to save the file as in S3

        // Create an S3 client
        S3Client s3 = S3Client.builder()
                .region(region)
                .credentialsProvider(ProfileCredentialsProvider.create())
                .build();

        // Upload the file
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyName)
                    .build();

            s3.putObject(putObjectRequest, new File(filePath).toPath());
            System.out.println("File uploaded successfully.");
        } catch (Exception e) {
            System.out.println("Error occurred: " + e.getMessage());
        } finally {
            s3.close();
        }
    }
}
