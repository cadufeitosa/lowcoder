package org.lowcoder.plugin.es.model;

import static org.lowcoder.sdk.exception.BizError.INVALID_DATASOURCE_CONFIG_TYPE;
import static org.lowcoder.sdk.util.ExceptionUtils.ofException;

import java.util.function.Function;

import lombok.extern.jackson.Jacksonized;
import org.apache.commons.lang3.ObjectUtils;
import org.lowcoder.sdk.config.SerializeConfig.JsonViews;
import org.lowcoder.sdk.models.DatasourceConnectionConfig;

import com.fasterxml.jackson.annotation.JsonView;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Setter
@Getter
@Builder
@Jacksonized
public class EsDatasourceConfig implements DatasourceConnectionConfig {

    private String connectionString;

    private String username;

    @JsonView(JsonViews.Internal.class)
    private String password;

    private Boolean usingSsl;

    @Override
    public DatasourceConnectionConfig mergeWithUpdatedConfig(DatasourceConnectionConfig updatedConfig) {
        if (!(updatedConfig instanceof EsDatasourceConfig esDatasourceConfig)) {
            throw ofException(INVALID_DATASOURCE_CONFIG_TYPE, "INVALID_DATASOURCE_CONFIG_TYPE", updatedConfig.getClass().getSimpleName());
        }

        return EsDatasourceConfig.builder()
                .connectionString(esDatasourceConfig.getConnectionString())
                .username(esDatasourceConfig.getUsername())
                .password(ObjectUtils.firstNonNull(esDatasourceConfig.getPassword(), getPassword()))
                .usingSsl(esDatasourceConfig.getUsingSsl())
                .build();
    }

    @Override
    public DatasourceConnectionConfig doEncrypt(Function<String, String> encryptFunc) {
        try {
            password = encryptFunc.apply(password);
            return this;
        } catch (Exception e) {
            log.error("fail to encrypt password: {}", password, e);
            return this;
        }
    }

    @Override
    public DatasourceConnectionConfig doDecrypt(Function<String, String> decryptFunc) {
        try {
            password = decryptFunc.apply(password);
            return this;
        } catch (Exception e) {
            log.error("fail to encrypt password: {}", password, e);
            return this;
        }
    }
}
