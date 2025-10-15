import boto3
import logging
import re
from urllib.parse import urlparse
from boto3.s3.transfer import TransferConfig
from django.conf import settings

import os
import time
import base64
import rsa

logger = logging.getLogger('s3')

transfer_config = TransferConfig(
    multipart_threshold=150 * 1024 * 1024,  # Por ejemplo, 50MB
    multipart_chunksize=10 * 1024 * 1024    # Cada parte de 10MB
)

class AWS_S3_Service:

    def __init__(self):
    
        if settings.IS_PROD:
            self.client = boto3.client('s3')
        else:
            self.client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
           
    def parse_s3_url(self, url):
        bucket = None
        object_key = None

        parsed_url = urlparse(url, allow_fragments=False)
        bucket_url = parsed_url.netloc
        matches = re.match(r'([0-9a-zA-Z\-_]+)\.s3\.amazonaws\.com', bucket_url)
        if matches:
            bucket = matches.group(1)
            object_key = parsed_url.path.lstrip('/')
        return bucket, object_key

    def generate_presigned_url(self, object_url, expires_in=900):
        bucket, object_key = self.parse_s3_url(object_url)
        if bucket is None or object_key is None:
            print(f'S3 url not parsed {object_url}')
            return None
        return self.client.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': bucket,
                'Key': object_key,
            },
            ExpiresIn=expires_in,
        )

    def upload_file(self, filepath, bucket_name, object_key):
        self.client.upload_file(filepath, bucket_name, object_key)
        uploaded_url = f'https://{bucket_name}.s3.amazonaws.com/{object_key}'
        return uploaded_url

    def upload_fileobj(self, fileobj, bucket_name, filename, mimetype=None):
        extra_args = {}
        if mimetype:
            extra_args['ContentType'] = mimetype
        self.client.upload_fileobj(
            fileobj,
            bucket_name,
            filename,
            ExtraArgs=extra_args,
            Config=transfer_config
        )
        uploaded_url = f'https://{bucket_name}.s3.amazonaws.com/{filename}'
        return uploaded_url

    def download_file(self, bucket_name, object_key, filename):
        return self.client.download_file(
            bucket_name,
            object_key,
            filename
        )


def generate_canned_policy_signed_url(
    resource_url: str,
    private_key_path: str,
    key_pair_id: str,
    expire_seconds: int = 600
) -> str:
    """
    Genera una URL firmada (Canned Policy) para CloudFront.
    
    :param resource_url: URL base (sin parámetros) que apunta al dominio de CloudFront 
                        Ejemplo: https://abc123xyz.cloudfront.net/path/to/file.mp4
    :param private_key_path: Ruta local al archivo PEM con la clave privada RSA
    :param key_pair_id: El ID de la clave pública asociada en CloudFront
    :param expire_seconds: Tiempo (en segundos) para que la firma caduque
    :return: URL firmada lista para usar
    """
    # Calcula el timestamp Unix de expiración
    expires = int(time.time()) + expire_seconds
    print(f"Expires: {expires}")
    print(f'Timestamp: {time.time()}')
    
    # Construye la parte de la query básica
    policy_query = f"Expires={expires}&Key-Pair-Id={key_pair_id}"
    
    # Para un Canned Policy, el string que se firma suele ser la URL (hasta el path) + la query
    # Sin incluir parámetros extra. Ejemplo: https://<cloudfront>/path?Expires=xxx&Key-Pair-Id=xxx
    url_components = urlparse(resource_url)
    url_to_sign = f"{url_components.scheme}://{url_components.netloc}{url_components.path}?{policy_query}"
    
    # Carga la clave privada RSA
    with open(private_key_path, 'rb') as pk_file:
        private_key = rsa.PrivateKey.load_pkcs1(pk_file.read())
    
    # Firma usando SHA-1 (que es lo requerido por CloudFront para URLs firmadas personalizadas)
    signature = rsa.sign(url_to_sign.encode('utf-8'), private_key, 'SHA-1')
    
    # Transforma la firma en Base64 "URL-safe"
    signature_base64 = base64.b64encode(signature).decode('utf-8')
    signature_base64 = signature_base64.replace('+', '-').replace('=', '_').replace('/', '~')
    
    # Devuelve la URL final con Signature
    signed_url = f"{url_components.scheme}://{url_components.netloc}{url_components.path}"
    signed_url += f"?{policy_query}&Signature={signature_base64}"
    return signed_url

