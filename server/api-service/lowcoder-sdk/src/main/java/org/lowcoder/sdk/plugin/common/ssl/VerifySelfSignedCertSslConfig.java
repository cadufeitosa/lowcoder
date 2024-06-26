package org.lowcoder.sdk.plugin.common.ssl;

import static org.apache.commons.lang3.ObjectUtils.firstNonNull;

import java.util.function.Function;

import lombok.experimental.SuperBuilder;
import lombok.extern.jackson.Jacksonized;
import org.jetbrains.annotations.Nullable;
import org.lowcoder.sdk.config.SerializeConfig.JsonViews;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonView;

import lombok.Getter;

@Getter
@SuperBuilder
@Jacksonized
public class VerifySelfSignedCertSslConfig extends SslConfig {

    @JsonView(JsonViews.Internal.class)
    private String selfSignedCert;

    @Override
    public void doEncrypt(Function<String, String> encryptFunc) {
        this.selfSignedCert = encryptFunc.apply(this.selfSignedCert);
    }

    @Override
    public void doDecrypt(Function<String, String> decryptFunc) {
        this.selfSignedCert = decryptFunc.apply(this.selfSignedCert);
    }

    @Override
    public SslConfig mergeWithUpdatedConfig(@Nullable SslConfig updatedConfig) {
        if (!(updatedConfig instanceof VerifySelfSignedCertSslConfig verifySelfSignedCertSSLConfig)) {
            return updatedConfig;
        }
        return VerifySelfSignedCertSslConfig.builder()
                .sslCertVerificationType(verifySelfSignedCertSSLConfig.getSslCertVerificationType())
                .selfSignedCert(firstNonNull(verifySelfSignedCertSSLConfig.selfSignedCert, this.selfSignedCert))
                .build();
    }
}
